import React from 'react';
import Member from './Member';
import { Modal, Form, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';
import axios from 'axios';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getAllUsers } from '../actions/getAllUsers';
import { addUsers } from '../actions/addUsers';

class MembersList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false,
      usernames: [],
      suggestions: [],
      value: ''
    };
  }

  componentDidMount() {
    // axios.get('http://localhost:3000/api/users')
    // .then((resp) => {
    //   var usernames = resp.data.users.map((user) => user.username);
    //   this.setState({usernames: usernames, users: resp.data.users});
    // })
    // .catch((err) => console.log('cannot get all users'));
    this.props.getAllUsersDispatch();
  }

  componentWillReceiveProps(props) {
    // this.setState({communityId: props.communityId});
  }

  escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // When suggestion is clicked, Autosuggest needs to populate the input
  // based on the clicked suggestion. Teach Autosuggest how to calculate the
  // input value for every given suggestion.
  getSuggestionValue(suggestion) {
    return suggestion.username;
  }

  getSuggestions(value) {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;
    // returns an array of matches
    return inputLength === 0 ? [] : this.state.usernames.filter(user =>
      user.slice(0, inputLength) === inputValue
    );
  }

  renderSuggestion(suggestion) {
    return (
      <div>
        {suggestion}
      </div>
    );
  }

  // Autosuggest will call this function every time you need to update suggestions.
  // You already implemented this logic above, so just use it.
  onSuggestionsFetchRequested({value}) {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  }

  // Autosuggest will call this function every time you need to clear suggestions.
  onSuggestionsClearRequested() {
    this.setState({
      suggestions: []
    });
  }

  open() {
    this.setState({showModal: true});
  }

  close() {
    this.setState({showModal: false});
  }

  onValueChange(e) {
    var newValue = e.target.value || e.currentTarget.textContent;
    this.setState({value: newValue});
  }

  onAdd(e) {
    e.preventDefault();
    const username = this.input.input.defaultValue;
    const communityId = this.props.commId;
    axios.post('http://localhost:3000/api/user', {
      username,
      communityId
    })
    .then((resp) => {
      axios.get('http://localhost:3000/api/users/' + username)
      .then((resp) => {
        var user = resp.data.user;
        this.props.handleAddUsers(user);
        this.close();
      });
    })
    .catch((err) => {
      console.log(err);
    });
  }

  render() {
    const value = this.state.value;
    const usernames = this.state.usernames;
    const suggestions = this.state.suggestions;
    const inputProps = {
      placeholder: 'Type a username',
      value,
      onChange: this.onValueChange.bind(this)
    };
    // if (usernames) {
      return (
        <div className="members-list">
          <div>
            <button onClick={() => this.open()} className="add-members-button">Add members</button>
            <h2>Members</h2>
            <div className="members-box">
              {this.props.commUsers.map((user, index) =>
                <Member key={index} user={user}/>
              )}
            </div>
            <Modal show={this.state.showModal} onHide={() => this.close()}>
              <Modal.Header closeButton>
                <Modal.Title>More neighbors! More fun!</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <FormGroup>
                    <ControlLabel>Add memebers</ControlLabel>
                    <Autosuggest
                      ref={(input) => {this.input = input;}}
                      suggestions={suggestions}
                      onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                      onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
                      getSuggestionValue={this.getSuggestionValue.bind(this)}
                      renderSuggestion={this.renderSuggestion.bind(this)}
                      inputProps={inputProps}
                    />
                    <Button onClick={(e) => this.onAdd(e)}>Add</Button>
                  </FormGroup>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button onClick={() => this.close()}>Cancel</Button>
              </Modal.Footer>
            </Modal>
          </div>
          <Modal show={this.state.showModal} onHide={() => this.close()}>
            <Modal.Header closeButton>
              <Modal.Title>More neighbors! More fun!</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <FormGroup>
                  <ControlLabel>Add memebers</ControlLabel>
                  <Autosuggest
                    ref={(input) => {this.input = input;}}
                    suggestions={suggestions}
                    onSuggestionsFetchRequested={this.onSuggestionsFetchRequested.bind(this)}
                    onSuggestionsClearRequested={this.onSuggestionsClearRequested.bind(this)}
                    getSuggestionValue={this.getSuggestionValue.bind(this)}
                    renderSuggestion={this.renderSuggestion.bind(this)}
                    inputProps={inputProps}
                  />
                  <Button onClick={(e) => this.onAdd(e)}>Add</Button>
                </FormGroup>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => this.close()}>Cancel</Button>
            </Modal.Footer>
          </Modal>
        </div>
    );
  }
}

MembersList.propTypes = {
  commUsers: PropTypes.array,
  commId: PropTypes.string,
  getAllUsersDispatch: PropTypes.func,
  addUsersDispatch: PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    allUsers: state.allUsers
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllUsersDispatch: () => dispatch(getAllUsers()),
    addUsersDispatch: () => dispatch(addUsers())
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(MembersList);
