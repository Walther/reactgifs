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
        <h2>{this.state.data.title}</h2>
        <p>posted by: {this.state.data.author} </p>
        {images}
        <CommentList comments={this.state.data.comments} />
      </div>
    );
  }
});

// Class for the image posting form
var ImageForm = React.createClass({
  render: function() {
    return (
      <div className="imageForm">
        Placeholder - Image submit form here.
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
        <h3>Comments</h3>
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
    id = "api/" + id;
    ReactDOM.render(<Post url={id}/>, document.getElementById('content'))
  }
}

// Run main at least once on initial load
main();

// Re-run main if the hash-url changes
$(window).on('hashchange', function() {
  main();
})