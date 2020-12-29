var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PostSchema = new Schema(
  {
    body: {type: String, required: true, maxlength: 300},
    title: {type: String, required: true, maxlength: 100},
    created_at: {type: Date},
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  }
);

// Virtual for author's full name

// Virtual for author's lifespan

// Virtual for author's URL
PostSchema
.virtual('url')
.get(function () {
  return '/delete/' + this._id;
});

//Export model
module.exports = mongoose.model('Post', PostSchema);