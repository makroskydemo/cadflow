/* Adapter-owned trees only. Engine caches marked p3dvShared retain ownership. */
(function (root) {
    'use strict';
    function disposeTree(tree) {
        if (!tree)
            return;
        const geometries = new Set(), materials = new Set(), textures = new Set();
        tree.traverse(object => {
            if (object.geometry && !object.geometry.userData?.p3dvShared)
                geometries.add(object.geometry);
            for (const material of [].concat(object.material || [])) {
                if (material.userData?.p3dvShared)
                    continue;
                materials.add(material);
                // Three material texture slots are direct properties; deduplicate aliases.
                for (const value of Object.values(material)) {
                    if (value?.isTexture && !value.userData?.p3dvShared)
                        textures.add(value);
                }
            }
        });
        for (const geometry of geometries)
            geometry.dispose();
        for (const material of materials)
            material.dispose();
        for (const texture of textures)
            texture.dispose();
        tree.parent?.remove(tree);
        tree.clear();
    }
    root.PLMRResources = Object.freeze({ disposeTree });
})(window);
