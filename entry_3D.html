// 엔트리가 완전히 로드되었는지 확인 후 실행
const injectControl = () => {
    if (typeof Entry !== 'undefined' && Entry.variableContainer) {
        console.log("엔트리 감지 성공! 파트너, 조작을 시작하지.");

        // 예시 1: 특정 이름을 가진 변수 값 변경 함수
        window.setEntryVar = function(name, value) {
            const list = Entry.variableContainer.variables_;
            const target = list.find(v => v.getName() === name);
            if (target) {
                target.setValue(value);
                console.log(`${name} 변수를 ${value}로 변경했어.`);
            }
        };

        // 예시 2: 엔트리 함수 강제 실행 (3D 오브젝트 생성 등)
        window.spawnCube = function(x, y, z) {
            if (Entry.create_3d_object) {
                const obj = Entry.create_3d_object("cube");
                obj.set_position(x, y, z);
            }
        };
    } else {
        // 아직 로딩 중이면 0.5초 뒤에 다시 시도
        setTimeout(injectControl, 500);
    }
};

injectControl();
