import React from 'react';

import Scroll from 'react-scroll';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AssetHistory from './asset_history';


const Assets = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        assetList: React.PropTypes.array
    },

    getInitialState() {
        return { value: "" };
    },

    handleInputSubmit(event) {
        event.preventDefault();
        const { activeAccount } = this.props;
        const { value } = this.state;

        const payloadToPost = {
            to: activeAccount.vk,
            content: value
        };
        AssetActions.postAsset({
            payloadToPost,
            account: activeAccount
        });

        this.setState({ value: "" });

        Scroll.animateScroll.scrollToBottom();
    },

    handleInputChange(event) {
        this.setState({ value: event.target.value });
    },

    render() {
        const {
            activeAccount,
            assetList
        } = this.props;

        const { value } = this.state;

        if (!assetList || !activeAccount) {
            return (
                <div className="content-text">
                    Select account from the list...
                </div>
            );
        }

        return (
            <div>
                <AssetHistory
                    assetList={assetList} />
                <form onSubmit={this.handleInputSubmit}>
                    <input
                        autoFocus
                        className="navbar-fixed-bottom"
                        onChange={this.handleInputChange}
                        placeholder="Type what you want to share on the blockchain"
                        value={value} />
                </form>
            </div>
        );
    }
});

export default Assets;
