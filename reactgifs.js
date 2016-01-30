// ReactGIFs - React-based image sharing platform
// veeti "walther" haapsamo 2016


// Post has a title, one or more images with captions, and a comment box
var Post = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    console.log("Post debug: url = " + this.props.url);
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log("Post debug: data = " + JSON.stringify(data));
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    console.log("Post debug: Images: " + this.state.data.images);
    if (this.state.data.images) {
      var images = this.state.data.images.map(function(image) {
        return (
          <Image alt={image.alt} src={image.src} txt={image.txt} />
        )
      })
    } else {
      return (<p>loading...</p>);
    }

    return (
      <div className="post">
        <h1>{this.state.data.title}</h1>
        <p>posted by: {this.state.data.author} </p>
        {images}
        <CommentList comments={this.state.data.comments} profile={this.props.profile} />
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
    var author = this.state.profile.nickname;
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
    $.each(jQuery('#file')[0].files, function(i, file) {
        data.append('file-'+i, file);
    });

    var form = document.querySelector('form')
    var postImages = fetch('/upload', {
      body: data,
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken')
      },
      method: 'POST',
      cache: false,
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
          <input type="hidden" name="command" value="post" />
          <br/>
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
        <p>Loading profile data</p>
      );
    }
  }
});

// Individual image object
var Image = React.createClass({
  render: function() {
    return (
      <figure className="image">
        <img alt={this.props.alt} src={this.props.src} />
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
      </Comment>
    )
    });
    if (this.props.profile) {
      return (
        <div className="commentList">
        <div className="clear"></div>
        <h2>Comments</h2>
        {commentNodes}
        <CommentForm profile={this.props.profile}/>
        </div>
      )
    } else {
        return (
        <div className="commentList">
        <div className="clear"></div>
        <h2>Comments</h2>
        {commentNodes}
        <div className="login-box">
          <a onClick={this.showLock}>Sign in to comment</a>
        </div>
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

    var obj = {
      "command": "comment",
      "author": author,
      "text": text,
      "imageid": location.pathname.slice(1)
    }

    var postImages = fetch('/api', {
      body: JSON.stringify(obj),
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('userToken'),
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      cache: false,
    });

    this.setState(this.getInitialState());
    location.reload();
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <p>Posting comment as {this.props.profile.nickname}</p>
        <input
          type="text"
          placeholder="Text"
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
    this.props.lock.show();
  },

  render: function() {
    return (
    <div className="login-box">
      <a onClick={this.showLock}>Sign in to post</a>
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
    this.setState({idToken: this.getIdToken()});
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
  render: function() {
    var pageId = window.location.pathname.slice(1);
    console.log("current page id: " + pageId);
    // Index page
    if (pageId.length === 0) {
      // Logged in, show submit form
      if (this.state.idToken) {
        return(
          <div className="index">
            <h1>ReactGIFs</h1>
            <p>ReactGIFs is a React-based image sharing site.</p>
            <ImageForm profile={this.state.profile}/>
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
      return(<Post url={pageId} profile={this.state.profile}/>);
    }
  }
})

// Run main at least once on initial load
ReactDOM.render(<Main />, document.getElementById('content'));
