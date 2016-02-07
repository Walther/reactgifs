// ReactGIFs - React-based image sharing platform
// veeti "walther" haapsamo 2016

// a Gallery is a page with its own url; a post submitted by a user.
// Gallery has a title, one or more images with captions, and a comment box
var Gallery = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    console.debug("Gallery debug: url = " + this.props.url);
    var page = this;
    var loadPage = fetch(page.props.url)
    .then(function (response) {
      // Fail if response !== 200
      if (response.status !== 200) {
        page.setState({error: response.status});
        console.debug("Debug: response: " + JSON.stringify(response.status));
        return;
      }

      response.json().then(function (data) {
        console.debug("Debug: Data: " + data)
        page.setState({data: data})
      });
    })
  },
  render: function() {
    console.debug("Gallery debug: Images: " + this.state.data.images);
    if (this.state.data.images) {
      var images = this.state.data.images.map(function(image) {
        return (
          <Image src={image.src} txt={image.txt} key={image.src} />
        )
      })
    }

    else if (this.state.error) {
      return (
        <p>Error: {this.state.error}</p>
      )
    }

    else {
      return (
        <p>loading...</p>);
    }

    return (
      <div className="gallery">
        <h1>{this.state.data.title}</h1>
        <p>posted by: {this.state.data.author} </p>
        {images}
        <div className="clear"></div>
        <CommentList comments={this.state.data.comments} profile={this.props.profile} lock={this.props.lock}/>
      </div>
    );
  }
})

// Class for the image posting form
var ImageForm = React.createClass({
  getInitialState: function() {
    return {title: '', caption: '', profile: this.props.profile};
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleCaptionChange: function(e) {
    this.setState({caption: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.props.profile.nickname;
    var title = this.state.title.trim();
    var caption = this.state.caption.trim();
    if (!title || !caption ) {
      console.log("something was empty")
      return;
    }

    var data = new FormData();
    data.append("author", author);
    data.append("title", title);
    data.append("caption", caption);
    var files = document.querySelector('#file').files;
    var i=0;
    for (var file in files) {
      data.append('file-'+i, files[file]);
      i++;
    }

    var form = document.querySelector('form')
    var postImages = fetch('/upload', {
      body: data,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      },
      method: 'POST'
    });

    postImages.then(function (response) {
      response.json().then(function (data) {
        console.log("Data response: " + data)
        window.location.pathname=data;
      });

    });
  },

  render: function() {
    if (this.props.profile) {
      return (
        <form className="imageForm" encType="multipart/form-data" onSubmit={this.handleSubmit}>
          <h2>Post an image</h2>
          <input type="hidden" name="command" value="post" />
          <p>Logged in and posting as: {this.props.profile.nickname}</p>
          <input
            type="text"
            placeholder="Title"
            value={this.state.title}
            onChange={this.handleTitleChange}
          />
          <br/>
          <input id="file" type="file" name="file" />
          <br/>
          <input
            type="text"
            placeholder="Caption"
            value={this.state.caption}
            onChange={this.handleCaptionChange}
          />
          <br/>
          <input type="submit" value="Post image" className="button"/>
        </form>
      );
    } else {
      return (
        <p>Loading profile data... If problem persists, try to log out and log in again.</p>
      );
    }
  }
});

// Individual image object
var Image = React.createClass({
  render: function() {
    return (
      <figure className="image">
        <img alt={this.props.txt} title={this.props.txt} src={this.props.src} />
        <figcaption>{this.props.txt}</figcaption>
      </figure>
    );
  }
});


// Comments
var CommentList = React.createClass({
  render: function() {
    var commentNodes = this.props.comments.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
          <hr />
        </Comment>
      )
    });
    if (this.props.profile) {
      return (
        <div className="commentList">
        <div className="clear"></div>
        <h2>Comments</h2>
        {commentNodes}
        <div className="clear"></div>
        <CommentForm profile={this.props.profile}/>
        <LogoutBox />
        </div>
      )
    } else {
        return (
        <div className="commentList">
        <div className="clear"></div>
        <h2>Comments</h2>
        {commentNodes}
        <div className="clear"></div>
        <LoginBox lock={this.props.lock}/>
        </div>
      )
    }
  }
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    console.log("button clicked")
    e.preventDefault();
    var author = this.props.profile.nickname;
    var text = this.state.text.trim();
    if (!author || !text ) {
      console.log("something was empty")
      return;
    }

    var commentObject = {
      "command": "comment",
      "author": author,
      "text": text,
      "imageid": location.pathname.slice(1)
    }

    var postImages = fetch('/api', {
      body: JSON.stringify(commentObject),
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });

    this.setState(this.getInitialState());
    location.reload();
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <p>Posting comment as {this.props.profile.nickname}</p>
        <textarea
          type="text"
          placeholder="Text"
          className="commentTextInput"
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <br/>
        <input className="button" type="submit" value="Submit comment" />
      </form>
    );
  }
});

var Comment = React.createClass({
  render: function() {
    return (
      <div className="comment">
        <strong className="commentAuthor">
          {this.props.author}:
        </strong>
        {this.props.children}
      </div>
    );
  }
});

// Login box
var LoginBox = React.createClass({
  showLock: function() {
    // We receive lock from the parent component in this case
    // If you instantiate it in this component, just do this.lock.show()
    this.props.lock.show({
      callbackURL: "http://" + location.host,
      responseType: 'token',
      authParams: {
        state: location.pathname.slice(1)
      }
    });
  },

  render: function() {
    return (
    <div className="login-box">
      <button className="button" onClick={this.showLock}>Sign in to post</button>
    </div>);
  }
});

// Logout box
var LogoutBox = React.createClass({
  logout: function() {
    localStorage.removeItem("userToken");
    location.reload();
  },

  render: function() {
    return (
    <div className="logout-box">
      <button className="button" onClick={this.logout}>Log out</button>
    </div>);
  }
});

// Main render function;
// serve either index page or the page content requested
var Main = React.createClass({
  // Instantiate idToken / auth0
  getInitialState: function() {
    return {profile: null};
  },
  componentWillMount: function() {
    this.lock = new Auth0Lock('N1zyz6FaQspe9Z0bX9QrUPMbp5rWEidR', 'reactgifs.eu.auth0.com');
    this.setState({idToken: this.getIdToken(), url: this.getPrevUrl()});
    this.clearUrlHash();
  },
  componentDidMount: function() {
    this.lock.getProfile(this.state.idToken, function (err, profile) {
      if (err) {
        console.log("Error loading the Profile", err);
        return;
      }
      this.setState({profile: profile});
      console.log("Profile: " + profile)
    }.bind(this));
  },
  getIdToken: function() {
    var idToken = localStorage.getItem('userToken');
    var authHash = this.lock.parseHash(window.location.hash);
    if (!idToken && authHash) {
      if (authHash.id_token) {
        idToken = authHash.id_token
        localStorage.setItem('userToken', authHash.id_token);
      }
      if (authHash.error) {
        console.log("Error signing in", authHash);
        return null;
      }
    }
    return idToken;
  },
  getPrevUrl: function() {
    var authHash = this.lock.parseHash(window.location.hash);
    if (authHash && authHash.state) {
      location.pathname = authHash.state;
    }
  },
  clearUrlHash: function() {
    window.location.hash = '';
  },
  render: function() {
    var pageId = window.location.pathname.slice(1);
    console.debug("Gallery debug: page id: " + pageId);
    // Index page
    if (pageId.length === 0) {
      // Logged in, show submit form
      if (this.state.idToken) {
        return(
          <div className="index">
            <h1>ReactGIFs</h1>
            <p>ReactGIFs is a React-based image sharing site.</p>
            <p>Kindly note the 2MB image size limit.</p>
            <p>Allowed filetypes: png|jpg|jpeg|gif|mp4|webp</p>
            <ImageForm profile={this.state.profile}/>
            <LogoutBox />
          </div>
        );
        }
      // Not logged in, show login form
      else {
        return(
          <div className="index">
            <h1>ReactGIFs</h1>
            <p>ReactGIFs is a React-based image sharing site.</p>
            <LoginBox lock={this.lock}/>
          </div>
        );
      }
    }
    else {
      // Image post page, show post + comments
      pageId = "data/" + pageId;
      return(<Gallery url={pageId} profile={this.state.profile} lock={this.lock}/>);
    }
  }
})

// Run main at least once on initial load
ReactDOM.render(<Main />, document.getElementById('content'));
