import { combineReducers } from 'redux';
import todolist from './todos';
import messageList from './testMsg'
// import visibilityFilter from './visibilityFilter';

const reducer = combineReducers({
    todolist,
    messageList,
});

export default reducer;
