(function (root) {
  'use strict';

  const SCHEMA = 'plmr-transaction-command-engine-v1';
  const DEFAULT_MEMORY_BUDGET = 24 * 1024 * 1024;
  const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
  const stable = value => JSON.stringify(value, Object.keys(value || {}).sort());
  function byteSize(value) { return BufferLikeByteLength(JSON.stringify(value == null ? null : value)); }
  function BufferLikeByteLength(text) {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(String(text)).length;
    if (typeof Buffer !== 'undefined') return Buffer.byteLength(String(text), 'utf8');
    return unescape(encodeURIComponent(String(text))).length;
  }
  function signature(value) {
    const text = JSON.stringify(value == null ? null : value);
    let hash = 2166136261;
    for (let i = 0; i < text.length; i += 1) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); }
    return `${text.length}:${(hash >>> 0).toString(16)}`;
  }
  function normalizeCommand(command, index) {
    const source = command && typeof command === 'object' ? command : { type: String(command || 'change') };
    return Object.freeze({
      id: String(source.id || `STEP-${String(index + 1).padStart(3, '0')}`),
      type: String(source.type || source.name || 'change'),
      label: String(source.label || source.type || source.name || 'Değişiklik'),
      origin: String(source.origin || 'local'),
      payload: clone(source.payload == null ? null : source.payload)
    });
  }
  function create(options) {
    const opts = options && typeof options === 'object' ? options : {};
    const maxEntries = Math.max(2, Math.round(Number(opts.maxEntries) || 50));
    const memoryBudgetBytes = Math.max(1024 * 1024, Number(opts.memoryBudgetBytes) || DEFAULT_MEMORY_BUDGET);
    const state = { current: clone(opts.initialState), undo: [], redo: [], active: null, sequence: 0, bytes: 0 };
    const listeners = new Set();
    function emit(type, entry) { const event=Object.freeze({schema:SCHEMA,type,entry:entry?summary(entry):null}); listeners.forEach(fn=>{try{fn(event)}catch(_){}}); return event; }
    function summary(entry) { return Object.freeze({ id: entry.id, label: entry.label, commandCount: entry.commands.length, commands: entry.commands.map(c=>({id:c.id,type:c.type,label:c.label,origin:c.origin})), bytes: entry.bytes, createdAt: entry.createdAt }); }
    function recomputeBytes() { state.bytes = state.undo.reduce((sum,e)=>sum+e.bytes,0)+state.redo.reduce((sum,e)=>sum+e.bytes,0); }
    function trim() { while(state.undo.length>maxEntries) state.undo.shift(); recomputeBytes(); while(state.undo.length>1 && state.bytes>memoryBudgetBytes){state.undo.shift();recomputeBytes();} return {entries:state.undo.length+state.redo.length,bytes:state.bytes}; }
    function begin(label, meta) { if(state.active) throw new Error('TRANSACTION_ALREADY_ACTIVE'); state.active={id:`TX-${String(++state.sequence).padStart(6,'0')}`,label:String(label||'İşlem'),meta:clone(meta||{}),before:clone(state.current),working:clone(state.current),commands:[],createdAt:new Date().toISOString()}; emit('transaction:started',state.active); return state.active.id; }
    function apply(command, reducer) { if(!state.active) begin(command&&command.label||command&&command.type||'İşlem',{implicit:true}); const normalized=normalizeCommand(command,state.active.commands.length); const fn=typeof reducer==='function'?reducer:command&&typeof command.apply==='function'?command.apply:null; if(!fn) throw new Error('TRANSACTION_COMMAND_APPLY_REQUIRED'); const next=fn(clone(state.active.working),clone(normalized.payload),normalized); if(next===undefined) throw new Error('TRANSACTION_COMMAND_RETURN_REQUIRED'); state.active.working=clone(next); state.active.commands.push(normalized); return clone(state.active.working); }
    function commit(finalState) { if(!state.active) return false; if(finalState!==undefined) state.active.working=clone(finalState); const active=state.active; state.active=null; if(signature(active.before)===signature(active.working)){state.current=clone(active.working);emit('transaction:noop',active);return false;} const entry={...active,after:clone(active.working)}; entry.bytes=byteSize(entry.before)+byteSize(entry.after)+byteSize(entry.commands); Object.freeze(entry.commands); state.undo.push(Object.freeze(entry)); state.redo=[]; state.current=clone(entry.after); trim(); emit('transaction:committed',entry); return summary(entry); }
    function rollback() { if(!state.active) return false; const active=state.active; state.current=clone(active.before); state.active=null; emit('transaction:rolled-back',active); return clone(state.current); }
    function transact(label, commands, reducer, meta) { begin(label,meta); try{(commands||[]).forEach(cmd=>apply(cmd,reducer));return commit();}catch(error){rollback();throw error;} }
    function undo() { if(state.active) throw new Error('TRANSACTION_ACTIVE'); const entry=state.undo.pop(); if(!entry)return null; state.redo.push(entry);state.current=clone(entry.before);recomputeBytes();emit('transaction:undone',entry);return {state:clone(state.current),entry:summary(entry)}; }
    function redo() { if(state.active) throw new Error('TRANSACTION_ACTIVE'); const entry=state.redo.pop(); if(!entry)return null;state.undo.push(entry);state.current=clone(entry.after);trim();emit('transaction:redone',entry);return {state:clone(state.current),entry:summary(entry)}; }
    function clear(nextState) { state.current=clone(nextState);state.undo=[];state.redo=[];state.active=null;state.bytes=0;emit('history:cleared',null); }
    function inspect() { return Object.freeze({schema:SCHEMA,canUndo:state.undo.length>0,canRedo:state.redo.length>0,active:Boolean(state.active),bytes:state.bytes,undo:Object.freeze(state.undo.map(summary)),redo:Object.freeze(state.redo.map(summary))}); }
    function subscribe(listener){if(typeof listener!=='function')throw new Error('TRANSACTION_LISTENER_REQUIRED');listeners.add(listener);return()=>listeners.delete(listener);}
    return Object.freeze({state,begin,apply,commit,rollback,transact,undo,redo,clear,inspect,subscribe,trim,getState:()=>clone(state.current)});
  }
  function createLegacyAdapter(options) {
    const manager=options&&options.historyManager || root.PulumurHistoryManager;if(!manager||typeof manager.begin!=='function'||typeof manager.end!=='function')throw new Error('LEGACY_HISTORY_MANAGER_REQUIRED');
    const journal=[];let active=null;let sequence=0;
    function begin(action){active={id:`LEGACY-TX-${String(++sequence).padStart(6,'0')}`,label:String(action&&action.type||action&&action.label||'İşlem'),action:clone(action||null),startedAt:new Date().toISOString()};manager.begin(action);return active.id;}
    function end(model,commit){const recorded=manager.end(model,commit);if(active){journal.push(Object.freeze({...active,committed:commit!==false&&Boolean(recorded),completedAt:new Date().toISOString()}));if(journal.length>200)journal.shift();active=null;}return recorded;}
    function describe(){return Object.freeze(journal.map(item=>Object.freeze({...item})));}
    return Object.freeze({begin,end,describe,get active(){return active;}});
  }
  const api=Object.freeze({SCHEMA,DEFAULT_MEMORY_BUDGET,signature,create,createLegacyAdapter});
  root.PulumurTransactionCommandEngine=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
