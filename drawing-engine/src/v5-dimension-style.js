/* Shared visual standard for roof and independent facade dimensions. Physical geometry stays in its provider. */
(function (root) {
  'use strict';

  const T = root.THREE;
  function label(g, text, point, quaternion, color, height, meta) {
    const chars = Math.max(7, text.length),
      w = Math.max(460, chars * height * .52),
      canvas = document.createElement('canvas');
    canvas.width = Math.ceil(w * 2);
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#f8fafcf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
    ctx.fillStyle = color;
    ctx.font = '700 ' + Math.round(height * 1.05) + 'px Segoe UI, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new T.CanvasTexture(canvas);
    texture.minFilter = T.LinearFilter;
    texture.generateMipmaps = false;
    const geo = new T.PlaneGeometry(w, height),
      mat = new T.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: T.FrontSide,
        depthTest: false,
        depthWrite: false
      }),
      wrapper = new T.Group();
    wrapper.position.copy(point);
    wrapper.quaternion.copy(quaternion);
    wrapper.userData = {
      ...meta,
      text,
      flatTextLabel: true,
      isDimension: true
    };
    for (const angle of [0, Math.PI]) {
      const mesh = new T.Mesh(geo, mat);
      mesh.rotation.y = angle;
      mesh.renderOrder = 56;
      mesh.userData = {
        ...meta,
        isDimension: true,
        dimensionLabel: true
      };
      wrapper.add(mesh);
    }
    g.add(wrapper);
    return wrapper;
  }
  function buildFacade(width, height, units = {
    mm: true
  }) {
    const group = new T.Group(),
      color = '#dc2626',
      z = 200,
      half = width / 2,
      below = -420,
      left = -half - 420;
    group.name = 'PLMR facade outer dimensions';
    group.userData = {
      annotation: true,
      isDimension: true,
      dimensionStandard: 'PLMR_ROOF_RED_190'
    };
    const format = value => root.PLMRUnits.formatMeasurement(value,units,false);
    const V = (x, y) => new T.Vector3(x, y, z),
      points = [];
    function measure(a, b, A, B, normal) {
      points.push(a, A, b, B, A, B);
      const direction = B.clone().sub(A).normalize();
      for (const [point, sign] of [[A, 1], [B, -1]]) for (const side of [-1, 1]) points.push(point, point.clone().addScaledVector(direction, sign * 60).addScaledVector(normal, side * 25));
    }
    measure(V(-half, 0), V(half, 0), V(-half, below), V(half, below), new T.Vector3(0, 1, 0));
    measure(V(-half, 0), V(-half, height), V(left, 0), V(left, height), new T.Vector3(1, 0, 0));
    const line = new T.LineSegments(new T.BufferGeometry().setFromPoints(points), new T.LineBasicMaterial({
      color,
      depthTest: false,
      transparent: true,
      opacity: .98
    }));
    line.renderOrder = 50;
    line.userData = {
      isDimension: true
    };
    group.add(line);
    label(group, format(width), V(0, below - 150), new T.Quaternion(), color, 190, {
      kind: 'dimension-width',
      labelHeight: 190
    });
    label(group, format(height), V(left - 150, height / 2), new T.Quaternion().setFromAxisAngle(new T.Vector3(0, 0, 1), Math.PI / 2), color, 190, {
      kind: 'dimension-height',
      labelHeight: 190
    });
    group.visible = !!(units.mm || units.inch || units.ft);
    group.updateCamera = () => {};
    return group;
  }
  root.PLMRDimensionStyle = Object.freeze({
    label,
    buildFacade
  });
})(window);
