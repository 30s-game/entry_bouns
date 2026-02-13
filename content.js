(function() {
    let scrollTimer = null;
    let scene, camera, renderer;

    if (!window.THREE) {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        document.head.appendChild(s);
    }

    const initRenderer = () => {
        if (window._entry_ext_renderer) return;
        const canvas = document.querySelector('#entryCanvas') || document.querySelector('canvas');
        if (!canvas) return;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
        renderer.domElement.style.cssText = `
            position: absolute; top: ${canvas.offsetTop}px; left: ${canvas.offsetLeft}px;
            pointer-events: none; z-index: 10;
        `;
        canvas.parentElement.appendChild(renderer.domElement);

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
        camera.position.z = 5;
        window._entry_ext_renderer = renderer;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
    };

    // 스크롤 전용 리스너 (루프 밖에서 한 번만 등록)
    if (!window._has_scroll_ev) {
        window._has_scroll_ev = true;
        window.addEventListener('wheel', (e) => {
            if (typeof Entry === 'undefined' || !Entry.variableContainer) return;
            
            // 이름이 [스크롤]인 변수 찾기
            const scrollVar = Entry.variableContainer.variables_.find(v => v.getName() === "[스크롤]");
            if (scrollVar) {
                const val = e.deltaY > 0 ? "down" : "up";
                scrollVar.setValue(val);
                if (Entry.requestUpdate) Entry.requestUpdate();

                if (scrollTimer) clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => {
                    scrollVar.setValue(0);
                    if (Entry.requestUpdate) Entry.requestUpdate();
                }, 150);
            }
        }, { passive: true });
    }

    const coreLoop = () => {
        if (typeof Entry === 'undefined' || !Entry.variableContainer) return;

        initRenderer();

        if (!Entry.add_mesh) {
            Entry.add_mesh = function(type = 'cube', color = 0x00ff00) {
                const geo = type === 'sphere' ? new THREE.SphereGeometry(0.5, 32, 32) : new THREE.BoxGeometry(1, 1, 1);
                const mat = new THREE.MeshLambertMaterial({ color });
                const mesh = new THREE.Mesh(geo, mat);
                scene.add(mesh);
                return mesh;
            };
        }

        const vars = Entry.variableContainer.variables_;
        vars.forEach(v => {
            const n = v.getName();

            if (n === "{작품ID]") {
                if (v.getValue() !== Entry.projectId) {
                    v.setValue(Entry.projectId || "");
                    if (Entry.requestUpdate) Entry.requestUpdate();
                }
            }

            if (n === "[마우스x]") v.setValue(Entry.stage.mouseTickX);
            if (n === "[마우스y]") v.setValue(Entry.stage.mouseTickY);
        });

        if (Entry.requestUpdate) Entry.requestUpdate();
    };

    setInterval(coreLoop, 500);
})();
