/*

Hierarchy plan:

Mainbox
ImageForm             // Submit new image
Post                  // A post has one or more images and one commentbox
    Image             // Image itself
    Image...
    CommentList       // List of the comments
      Comment         // Individual comment
      Comment         // May have same-level comments
        Comment       // May have children
*/

// Post has a title, one or more images with captions, and a comment box 
var Post = React.createClass({
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    console.log(this.state.data.images)
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
        <CommentList comments={this.state.data.comments} />
      </div>
    );
  }
});

// Class for the image posting form
var ImageForm = React.createClass({
  getInitialState: function() {
    return {author: '', title: '', src: '', txt: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTitleChange: function(e) {
    this.setState({title: e.target.value});
  },
  handleTxtChange: function(e) {
    this.setState({txt: e.target.value});
  },
  handleSrcChange: function(e) {
    this.setState({src: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var title = this.state.title.trim();
    var src = this.state.src.trim();
    var txt = this.state.txt.trim();
    if (!title || !author || !src || !txt ) {
      console.log("something was empty")
      return;
    }

    var obj = {
      "command": "post",
      "author": author,
      "title": title,
      "images": [
        {
          "src": src,
          "txt": txt,
          "alt": txt
        }
      ]
    }

    $.ajax({
      type: "POST",
      url: "/api",
      data: JSON.stringify(obj),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(data){alert(data);},
          failure: function(errMsg) {
              alert(errMsg);
          }
    });

    this.setState(getInitialState());
  },
  render: function() {
    return (
      <div className="imageForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Author"
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <br/>
        <input
          type="text"
          placeholder="Title"
          value={this.state.title}
          onChange={this.handleTitleChange}
        />
        <br/>
        <input
          type="text"
          placeholder="Source"
          value={this.state.src}
          onChange={this.handleSrcChange}
        />
        <br/>
        <input
          type="text"
          placeholder="Caption"
          value={this.state.txt}
          onChange={this.handleTxtChange}
        />
        <br/>
        <input type="submit" value="Post image" />
      </div>
    );
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
    return (
      <div className="commentList">
        <div className="clear"></div>
        <h2>Comments</h2>
        {commentNodes}
        <CommentForm />
      </div>
    );
  }
});

var CommentForm = React.createClass({
  render: function() {
    return (
      <div className="commentForm">
        Placeholder - Comment submit form here.
      </div>
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


// Main render function;
// serve either index page or the page content requested
var main = function() {
  var id = window.location.hash.slice(1);
  // Index page
  if (id.length === 0) {
    ReactDOM.render(
      <div className="index">
        <h1>ReactGIFs</h1>
        <p>ReactGIFs is a React-based image sharing site.</p>
        <ImageForm />
      </div>
      , document.getElementById('content'))
  }
  else {
    id = "data/" + id;
    ReactDOM.render(<Post url={id}/>, document.getElementById('content'))
  }
}

// Run main at least once on initial load
main();

// Re-run main if the hash-url changes
$(window).on('hashchange', function() {
  main();
})