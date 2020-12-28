import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
/*
 * @class TestMessage `新建事项`组件
 */
class TestMessage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        // const { messagelist } = this.props;
        return (
            <div>
                <div> Hello Enbe</div>
                <ul>
                    {
                        this.props.messageList.map((item, i) => {
                            return <li>{i}. {item.message}</li>
                        })
                    }
                </ul>
            </div>
        );
    }
}

TestMessage.propTypes = {
    messageList: PropTypes.arrayOf(
        PropTypes.shape({
            message: PropTypes.string.isRequired,
        }).isRequired).isRequired,
};
const mapStateToProps = (state) => {
    return { messageList: state.messageList };
};
export default connect(mapStateToProps)(TestMessage);
