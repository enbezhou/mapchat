import {
    GET_MESSAGE_LIST,
    Add_MESSAGE,
} from '../actions';

let testMsgs;
(() => {
    if (testMsgs == undefined) {
        console.log("reducer testMessage");
        testMsgs = [
            {'message': 'init...'},
            {'message': '开始.....'},
        ];
    }
})();
const messageList = (state = testMsgs, action) => {
    switch (action.type) {
        case  GET_MESSAGE_LIST:
            return state;
        case Add_MESSAGE:
            return [
                ...state, {
                    message: action.text,
                }
            ];
        default:
            return state;
    }
}
export default messageList;
