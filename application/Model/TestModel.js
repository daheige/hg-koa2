let BaseModel = require(__dirname + '/Base.class');
class TestModel extends BaseModel {
    constructor() {
        super();
    }
    test() {
        return "test model";
    }

}
module.exports = new TestModel; //采用单例模式，隐式返回this
