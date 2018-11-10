let BaseService = require(__dirname + '/Base.class');
class TestService extends BaseService {
    constructor() {
        super();
    }
    test() {
        return "test model";
    }
}

module.exports = TestService; //采用单例模式，隐式返回this
