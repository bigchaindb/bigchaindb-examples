import React from 'react/';

import { FormGroup, InputGroup, FormControl, Glyphicon } from 'react-bootstrap/lib/';


const Search = React.createClass({
    propTypes: {
        handleSearch: React.PropTypes.func,
        initialQuery: React.PropTypes.string
    },

    getInitialState() {
        return {
            timer: null,
            searchQuery: this.props.initialQuery,
            loading: false
        };
    },

    startTimer(searchQuery) {
        const { timer } = this.state;
        // The timer waits for the specified threshold time in milliseconds
        // and then calls `evaluateTimer`.
        // If another letter has been called in the mean time (timespan < `threshold`),
        // the present timer gets cleared and a new one is added to `this.state`.
        // This means that `evaluateTimer`, will only be called when the threshold has actually
        // passed, (tdaub)
        clearTimeout(timer); // apparently `clearTimeout` can be called with null, without throwing errors
        const newTimer = setTimeout(this.evaluateTimer(searchQuery), 500);

        this.setState({ timer: newTimer });
    },

    evaluateTimer(searchQuery) {
        return () => {
            this.setState({ timer: null, loading: true }, () => {
                this.handleSearch(searchQuery);
            });
        };
    },

    handleSearchThrottled(event) {
        // On each letter entry we're updating the state of the component
        // and start a timer, which we're also pushing to the state
        // of the component
        const value = event.target.value;
        this.startTimer(value);
        this.setState({ searchQuery: value });
    },

    handleSearch(searchQuery) {
        const { handleSearch } = this.props;
        handleSearch(searchQuery);
    },

    render() {
        const { searchQuery } = this.state;
        return (
            <div className="search-wrapper">
                <FormGroup>
                    <InputGroup>
                        <InputGroup.Addon><Glyphicon glyph="search" /></InputGroup.Addon>
                        <FormControl
                        onChange={this.handleSearchThrottled}
                        placeholder={'Search...'}
                        type="text"
                        value={searchQuery || ""}
                        />
                    </InputGroup>
                </FormGroup>
            </div>
        );
    }
});

export default Search;
