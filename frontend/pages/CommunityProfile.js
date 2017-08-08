import React from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CommunitiesList from '../components/CommunitiesList';
import MembersList from '../components/MembersList';
import styles from '../assets/stylesheets/communityprofile.less';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getOneCommunity } from '../actions/getOneCommunity';

class CommunityProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      community: {}
    };
  }

  componentDidMount() {
    this.props.getOneCommunity(this.props.match.params.communityId);
    // axios.get('http://localhost:3000/api/community/' + this.props.match.params.communityId)
    // .then((responseJson) => {
    //   this.setState({
    //     community: responseJson.data,
    //     loaded: true
    //   });
    // })
    // .catch((err) => {
    //   console.log("ERROR ON MOUNT ON COMMUNITY PROFILE PAGE", err);
    // });
  }

  handleAddUsers(user) {
    var users = this.state.community.users.concat(user);
    var newComm = Object.assign({}, this.state.community, {users});
    this.setState({community: newComm});
  }

  render() {
    console.log('CURRENT COMM', this.props.currentComm);
    return (
      <div className="community-profile-page">
        <Navbar />
        <div>
          <div className="community-splash">
            <div className="edit-profile-button">Edit Community Profile</div>
            <h1 className="title">COMMUNITY PROFILE</h1>
            <div className="stats-box">
              <div className="stat">
                <h1>4</h1>
                <h3>Given</h3>
              </div>
              <div className="stat">
                <h1>4</h1>
                <h3>Given</h3>
              </div>
              <div className="stat">
                <h1>4</h1>
                <h3>Given</h3>
              </div>
            </div>
            <Link to={'/community/' + this.props.match.params.communityId}>
            <div className="market-button">Go to Marketplace</div>
            </Link>
          </div>
          {
            this.props.currentComm.pending ? <h1>Loading...</h1> :
            // <h1>Working</h1>
          <MembersList
            commId={this.props.match.params.communityId}
            commUsers={this.props.currentComm.community.users} />
          }
          <Footer />
        </div>
      </div>
    );
  }
}

CommunityProfile.propTypes = {
  match: PropTypes.object,
  currentComm: PropTypes.object,
  getOneCommunity: PropTypes.func
};

const mapStateToProps = (state) => {
  return {
    currentComm: state.currentComm
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getOneCommunity: (communityId) => dispatch(getOneCommunity(communityId))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CommunityProfile);
