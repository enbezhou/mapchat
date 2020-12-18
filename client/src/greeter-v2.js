import React, {Component} from 'react';
import config from './config.json';
import styles from './Greeter.css';

class Greeterv2 extends Component{
    render() {
        return (
            <div className={styles.root}>
                {config.greetText}xx
            </div>
        );
    }
}
export default Greeterv2
