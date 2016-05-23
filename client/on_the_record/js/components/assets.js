import React from 'react/';

import { Row, Glyphicon } from 'react-bootstrap/lib/';

import Scroll from 'react-scroll';

import AssetActions from '../../../lib/js/react/actions/asset_actions';

import AscribeSpinner from '../../../lib/js/react/components/spinner';


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
        const { assetList } = this.props;
        const { value } = this.state;

        return (
            <div>
                <AssetHistory assetList={assetList}/>
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
        assetList: React.PropTypes.object
    },

    render() {
        const { assetList } = this.props;

        if (assetList && assetList.length > 0) {
            return (
                <div>{assetList
                        .sort((a, b) => a.transaction.timestamp - b.transaction.timestamp)
                        .map(asset => (
                            <AssetRow key={asset.id} asset={asset} />
                        ))
                }</div>
            );
        } else if (assetList && assetList.length) {
            return (
                <div className="content-text">
                    No messages found on BigchainDB. Start typing...
                </div>
            );
        }

        return (
            <div style={{ margin: '2em' }}>
                <AscribeSpinner />
            </div>
        );
    }
});


const AssetRow = React.createClass({
    propTypes: {
        asset: React.PropTypes.object
    },

    render() {
        const { asset } = this.props;
        const assetContent = asset.transaction.data ? asset.transaction.data.payload.content : '-';
        const validGlyph = asset.hasOwnProperty('assignee') ? <Glyphicon glyph="cog" />
                                                            : <Glyphicon glyph="ok" />;

        return (
            <Row>
                <div className="asset-container pull-right">
                    <div className="asset-container-id">
                        {asset.id}
                    </div>
                    <div className="asset-container-detail">
                        {assetContent}
                    </div>
                    <div className="asset-container-timestamp pull-right">
                        {new Date(parseInt(asset.transaction.timestamp, 10) * 1000).toGMTString()} + '   '}
                        {validGlyph}
                    </div>
                </div>
            </Row>
        );
    }
});

export default Assets;
