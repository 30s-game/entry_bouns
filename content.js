(function() {
    let scrollTimer = null;
    let scene, camera, renderer;

    // Three.js 라이브러리 로드
    if (!window.THREE) {
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        document.head.appendChild(s);
    }

    // 3D 렌더러 초기화 함수
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

        // 파이썬/블록용 API 확장
        if (!Entry.add_mesh) {
            Entry.add_mesh = function(type = 'cube', color = 0x00ff00) {
                const geo = type === 'sphere' ? new THREE.SphereGeometry(0.5, 32, 32) : new THREE.BoxGeometry(1, 1, 1);
                const mat = new THREE.MeshLambertMaterial({ color });
                const mesh = new THREE.Mesh(geo, mat);
                scene.add(mesh);
                return mesh;
            };
        }

        // 변수 실시간 매핑
        const vars = Entry.variableContainer.variables_;
        vars.forEach(v => {
            const n = v.getName();

            // {작품ID] 매핑
            if (n === "{작품ID]") {
                if (v.getValue() !== Entry.projectId) {
                    v.setValue(Entry.projectId || "");
                    if (Entry.requestUpdate) Entry.requestUpdate();
                }
            }

            // [스크롤] 매핑 (강화 버전)
            if (n === "[스크롤]" && !window._has_scroll_ev) {
                window._has_scroll_ev = true;
                window.addEventListener('wheel', (e) => {
                    const val = e.deltaY > 0 ? "down" : "up";
                    v.setValue(val);
                    
                    // 엔진에 즉시 업데이트 요청
                    if (Entry.requestUpdate) Entry.requestUpdate();

                    if (scrollTimer) clearTimeout(scrollTimer);
                    scrollTimer = setTimeout(() => {
                        v.setValue(0);
                        if (Entry.requestUpdate) Entry.requestUpdate();
                    }, 150);
                }, { passive: true });
            }

            // [마우스x], [마우스y] 매핑
            if (n === "[마우스x]") {
                v.setValue(Entry.stage.mouseTickX);
            }
            if (n === "[마우스y]") {
                v.setValue(Entry.stage.mouseTickY);
            }
        });
        
        // 마우스 좌표 등이 바뀔 때 화면 갱신 유도
        if (Entry.requestUpdate) Entry.requestUpdate();
    };

    // 0.5초마다 루프 실행
    setInterval(coreLoop, 500);
})();
