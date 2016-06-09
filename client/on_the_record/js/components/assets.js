import React from 'react';

import Scroll from 'react-scroll';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AssetDetail from '../../../lib/js/react/components/asset_detail';

import Spinner from '../../../lib/js/react/components/spinner';


const Assets = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        assetList: React.PropTypes.object
    },

    getInitialState() {
        return { value: null };
    },

    handleInputSubmit(event) {
        event.preventDefault();
        const { activeAccount } = this.props;
        const { value } = this.state;
        const payload = {
            to: activeAccount.vk,
            content: value
        };
        AssetActions.postAsset(payload);
        this.setState({ value: null });
        Scroll.animateScroll.scrollToBottom();
    },

    handleInputChange(event) {
        this.setState({ value: event.target.value });
    },

    render() {
        const { activeAccount, assetList } = this.props;
        const { value } = this.state;

        if (!activeAccount) {
            return (
                <div className="content-text">
                    Select account from the list...
                </div>
            );
        }
        return (
            <div>
                <AssetHistory
                    activeAccount={activeAccount}
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


const AssetHistory = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        assetList: React.PropTypes.object
    },

    render() {
        const { activeAccount, assetList } = this.props;

        if (assetList && Object.keys(assetList).indexOf(activeAccount.vk) > -1) {
            const assetListForAccount = assetList[activeAccount.vk];
            if (assetListForAccount.length) {
                return (
                    <div>
                        {assetListForAccount
                            .sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                            .map(asset => (
                                <AssetDetail
                                    key={asset.id}
                                    asset={asset} />
                            ))}
                    </div>
                );
            } else {
                return (
                    <div className="content-text">
                        No messages found in BigchainDB. Start typing...
                    </div>
                );
            }
        } else {
            return (
                <div style={{ margin: '2em' }}>
                    <Spinner />
                </div>
            );
        }
    }
});

export default Assets;
