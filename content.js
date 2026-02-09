(function() {
    let scrollTimer = null;
    let scene, camera, renderer;

    // Three.js 로드
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

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1).normalize();
        scene.add(light);

        window._entry_ext_renderer = renderer;

        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();
    };

    const coreLoop = () => {
        if (typeof Entry === 'undefined' || !Entry.variableContainer) return;

        initRenderer();

        // API 확장
        if (!Entry.add_mesh) {
            Entry.add_mesh = function(type = 'cube', color = 0x00ff00) {
                const geo = type === 'sphere' ? new THREE.SphereGeometry(0.5, 32, 32) : new THREE.BoxGeometry(1, 1, 1);
                const mat = new THREE.MeshLambertMaterial({ color });
                const mesh = new THREE.Mesh(geo, mat);
                scene.add(mesh);
                return mesh;
            };
        }

        // 변수 매핑 (요청한 이름으로 수정)
        const vars = Entry.variableContainer.variables_;
        vars.forEach(v => {
            const n = v.getName();

            // {작품ID]
            if (n === "[작품ID]") {
                if (v.getValue() !== Entry.projectId) v.setValue(Entry.projectId || "");
            }

            // [스크롤]
            if (n === "[스크롤]" && !window._has_scroll_ev) {
                window._has_scroll_ev = true;
                window.addEventListener('wheel', (e) => {
                    v.setValue(e.deltaY > 0 ? "down" : "up");
                    if (scrollTimer) clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(() => v.setValue(0), 150);
                }, { passive: true });
            }

            // [마우스x], [마우스y] - 소문자 적용
            if (n === "[마우스x]") v.setValue(Entry.stage.mouseTickX);
            if (n === "[마우스y]") v.setValue(Entry.stage.mouseTickY);
        });
    };

    setInterval(coreLoop, 500);
})();
