let BaseLogic = require(__dirname + '/Base.class');
class TestLogic extends BaseLogic {
    constructor() {
        super();
    }
    test() {
        return "test logic";
    }
}

module.exports = new TestLogic; //采用单例模式，隐式返回this
