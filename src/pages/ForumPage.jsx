import { useState, useEffect } from 'react'
import SideBar from '../components/SideBar'
import { auth } from '../firebase'
import { 
  getAllPosts,
  createPost,
  updatePostStatus,
  updatePost,
  getRepliesByPost,
  getAllReplies,
  createReply,
  getPostsByUser,
  getPostsUserParticipatedIn
} from '../services/resourceService'
import { 
  BiUser, 
  BiTime, 
  BiCommentDots, 
  BiPlus,
  BiFilter,
  BiCalendar,
  BiEdit
} from 'react-icons/bi'
import moment from 'moment'

// Date filter options
const DATE_FILTERS = {
  ALL: 'all',
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  WEEK: 'week',
  CUSTOM: 'custom'
}

// Post filter options
const POST_FILTERS = {
  ALL: 'all',
  MY_POSTS: 'my_posts',
  PARTICIPATING: 'participating'
}

// Status filter options
const STATUS_FILTERS = {
  ALL: 'all',
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  CLOSED: 'closed'
}

function ForumPage() {
  const [posts, setPosts] = useState([])
  const [selectedPost, setSelectedPost] = useState(null)
  const [replies, setReplies] = useState([])
  const [allReplies, setAllReplies] = useState([])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Edit state
  const [editingPost, setEditingPost] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  
  // Filters
  const [dateFilter, setDateFilter] = useState(DATE_FILTERS.ALL)
  const [postFilter, setPostFilter] = useState(POST_FILTERS.ALL)
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTERS.ALL)
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showFilterModal, setShowFilterModal] = useState(false)

  useEffect(() => {
    const currentUser = auth.currentUser
    setUser(currentUser)
    loadPosts()
    loadAllReplies()
  }, [])

  useEffect(() => {
    if (postFilter !== POST_FILTERS.ALL) {
      loadFilteredPosts()
    } else {
      loadPosts()
    }
  }, [postFilter])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const allPosts = await getAllPosts()
      setPosts(allPosts)
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAllReplies = async () => {
    try {
      const replies = await getAllReplies()
      setAllReplies(replies)
    } catch (error) {
      console.error('Error loading replies:', error)
    }
  }

  const loadFilteredPosts = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      let filtered = []
      
      if (postFilter === POST_FILTERS.MY_POSTS) {
        filtered = await getPostsByUser(user.uid)
      } else if (postFilter === POST_FILTERS.PARTICIPATING) {
        filtered = await getPostsUserParticipatedIn(user.uid)
      }
      
      setPosts(filtered)
    } catch (error) {
      console.error('Error loading filtered posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (postId) => {
    try {
      const postReplies = await getRepliesByPost(postId)
      setReplies(postReplies)
    } catch (error) {
      console.error('Error loading replies:', error)
    }
  }

  const handleSelectPost = async (post) => {
    setSelectedPost(post)
    await loadReplies(post.id)
  }

  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!user) return
    
    const formData = new FormData(e.target)
    const title = formData.get('title')
    const content = formData.get('content')
    
    if (!title || !content) return
    
    try {
      setSubmitting(true)
      await createPost({
        title,
        content,
        authorId: user.uid,
        authorName: user.displayName || user.email
      })
      
      await loadPosts()
      document.getElementById('new_post_modal').close()
      e.target.reset()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddReply = async (e) => {
    e.preventDefault()
    if (!user || !selectedPost || !replyText.trim()) return
    
    try {
      setSubmitting(true)
      await createReply({
        postId: selectedPost.id,
        content: replyText,
        authorId: user.uid,
        authorName: user.displayName || user.email
      })
      
      // Reload replies and posts
      await loadReplies(selectedPost.id)
      await loadPosts()
      await loadAllReplies()
      
      // Update selected post
      const updatedPosts = await getAllPosts()
      const updatedPost = updatedPosts.find(p => String(p.id) === String(selectedPost.id))
      if (updatedPost) {
        setSelectedPost(updatedPost)
      }
      
      setReplyText('')
    } catch (error) {
      console.error('Error adding reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateStatus = async (postId, newStatus) => {
    try {
      await updatePostStatus(postId, newStatus)
      await loadPosts()
      
      if (selectedPost && String(selectedPost.id) === String(postId)) {
        setSelectedPost({ ...selectedPost, status: newStatus })
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setEditTitle(post.title)
    setEditContent(post.content)
    document.getElementById('edit_post_modal').showModal()
  }

  const handleUpdatePost = async (e) => {
    e.preventDefault()
    if (!editingPost || !editTitle || !editContent) return
    
    try {
      setSubmitting(true)
      await updatePost(editingPost.id, {
        title: editTitle,
        content: editContent
      })
      
      await loadPosts()
      
      // Update selected post if it's the one being edited
      if (selectedPost && String(selectedPost.id) === String(editingPost.id)) {
        const updatedPosts = await getAllPosts()
        const updatedPost = updatedPosts.find(p => String(p.id) === String(editingPost.id))
        if (updatedPost) {
          setSelectedPost(updatedPost)
        }
      }
      
      document.getElementById('edit_post_modal').close()
      setEditingPost(null)
      setEditTitle('')
      setEditContent('')
    } catch (error) {
      console.error('Error updating post:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const canClosePost = (post) => {
    return user && post.authorId === user.uid
  }

  const filterPostsByDate = (posts) => {
    if (dateFilter === DATE_FILTERS.ALL) return posts
    
    const now = moment()
    
    return posts.filter(post => {
      const postDate = moment(post.createdAt)
      
      switch (dateFilter) {
        case DATE_FILTERS.TODAY:
          return postDate.isSame(now, 'day')
        case DATE_FILTERS.YESTERDAY:
          return postDate.isSame(now.clone().subtract(1, 'day'), 'day')
        case DATE_FILTERS.WEEK:
          return postDate.isAfter(now.clone().subtract(7, 'days'))
        case DATE_FILTERS.CUSTOM:
          if (customStartDate && customEndDate) {
            return postDate.isBetween(moment(customStartDate), moment(customEndDate), 'day', '[]')
          }
          return true
        default:
          return true
      }
    })
  }

  const filterPostsByStatus = (posts) => {
    if (statusFilter === STATUS_FILTERS.ALL) return posts
    return posts.filter(post => post.status === statusFilter)
  }

  const filteredPosts = filterPostsByStatus(filterPostsByDate(posts))

  const getReplyCount = (postId) => {
    // This would ideally come from the post object, but we can approximate
    return 0 // Will be updated when we load each post's replies
  }

  const PostViewer = ({ post, isModal, onBack }) => (
    <>
      {!isModal && (
        <button
          className="btn btn-sm btn-ghost mb-4"
          onClick={() => setSelectedPost(null)}
        >
          ← Back to Home
        </button>
      )}
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-bold text-lg flex-1">{post.title}</h3>
        {canClosePost(post) && (
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => handleEditPost(post)}
          >
            <BiEdit className="h-4 w-4" />
          </button>
        )}
        <div
          className={`badge ${
            post.status === 'open'
              ? 'badge-success'
              : post.status === 'in-progress'
              ? 'badge-warning'
              : 'badge-error'
          }`}
        >
          {post.status}
        </div>
      </div>
      
      <div className="py-4">
        <div className="flex flex-wrap items-center gap-4 text-sm opacity-70 mb-4 border-b pb-4">
          <div className="flex items-center gap-1">
            <BiUser /> {post.authorName}
          </div>
          <div className="flex items-center gap-1">
            <BiTime /> {moment(post.createdAt).fromNow()}
          </div>
        </div>
        
        <p className="text-base-content/90 whitespace-pre-wrap mb-6">{post.content}</p>
        
        {/* Replies Section */}
        <div className="mt-6">
          <div className="divider">Replies ({replies.length})</div>
          
          <div className="space-y-4">
            {replies.map(reply => (
              <div key={reply.id} className="card bg-base-200 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-center gap-3">
                    <div className="avatar placeholder">
                      <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                        <span>{reply.authorName?.charAt(0) || 'U'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="font-semibold">{reply.authorName}</span>
                      <span className="text-xs text-base-content/70 ml-2">
                        {moment(reply.createdAt).fromNow()}
                      </span>
                    </div>
                  </div>
                  <p className="text-base-content/90 mt-2 ml-11">{reply.content}</p>
                </div>
              </div>
            ))}
            {replies.length === 0 && (
              <p className="text-sm text-center text-base-content/60">No replies yet.</p>
            )}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleAddReply} className="mt-6">
            <div className="form-control">
              <p className="label-text font-semibold mb-3">Post a Reply</p>
              <textarea
                className="textarea textarea-bordered h-24"
                placeholder="Write your reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={submitting}
              ></textarea>
            </div>
            <div className="modal-action mt-4">
              <button type="submit" className="btn btn-primary" disabled={submitting || !replyText.trim()}>
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Posting...
                  </>
                ) : (
                  <>
                    <BiCommentDots className="mr-2" />
                    Post Reply
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="modal-action mt-0 pt-0">
        {canClosePost(post) && post.status !== 'closed' && (
          <button
            className="btn btn-error"
            onClick={() => handleUpdateStatus(post.id, 'closed')}
          >
            Close Post
          </button>
        )}
        {canClosePost(post) && post.status === 'closed' && (
          <button
            className="btn btn-success"
            onClick={() => handleUpdateStatus(post.id, 'open')}
          >
            Re-open Post
          </button>
        )}

        {isModal && (
          <button className="btn btn-ghost" onClick={onBack}>
            Close
          </button>
        )}
      </div>
    </>
  )

  const pageContent = (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center p-5 border-b border-base-300">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-primary">Forum</h1>
          {selectedPost && (
            <button 
              className="btn btn-sm btn-ghost"
              onClick={() => setSelectedPost(null)}
            >
              ← Home
            </button>
          )}
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => document.getElementById('new_post_modal').showModal()}
        >
          <BiPlus className="h-5 w-5" />
          Create Post
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-5 py-3 bg-base-200 border-b border-base-300">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            className={`btn btn-sm ${postFilter === POST_FILTERS.ALL ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPostFilter(POST_FILTERS.ALL)}
          >
            All Posts
          </button>
          <button
            className={`btn btn-sm ${postFilter === POST_FILTERS.MY_POSTS ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPostFilter(POST_FILTERS.MY_POSTS)}
          >
            My Posts
          </button>
          <button
            className={`btn btn-sm ${postFilter === POST_FILTERS.PARTICIPATING ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPostFilter(POST_FILTERS.PARTICIPATING)}
          >
            Participating
          </button>
          <div className="divider divider-horizontal"></div>
          
          {/* Status Filter Dropdown */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-sm btn-info">
              Status: {statusFilter === STATUS_FILTERS.ALL ? 'All' : statusFilter === STATUS_FILTERS.OPEN ? 'Open' : statusFilter === STATUS_FILTERS.IN_PROGRESS ? 'In Progress' : 'Closed'}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li><a onClick={() => setStatusFilter(STATUS_FILTERS.ALL)}>All Status</a></li>
              <li><a onClick={() => setStatusFilter(STATUS_FILTERS.OPEN)}>Open</a></li>
              <li><a onClick={() => setStatusFilter(STATUS_FILTERS.IN_PROGRESS)}>In Progress</a></li>
              <li><a onClick={() => setStatusFilter(STATUS_FILTERS.CLOSED)}>Closed</a></li>
            </ul>
          </div>

          {/* Date Filter Dropdown */}
          <div className="dropdown">
            <div tabIndex={0} role="button" className="btn btn-sm btn-accent">
              <BiCalendar className="h-4 w-4" />
              {dateFilter === DATE_FILTERS.ALL && 'All Time'}
              {dateFilter === DATE_FILTERS.TODAY && 'Today'}
              {dateFilter === DATE_FILTERS.YESTERDAY && 'Yesterday'}
              {dateFilter === DATE_FILTERS.WEEK && 'This Week'}
              {dateFilter === DATE_FILTERS.CUSTOM && customStartDate && customEndDate && `${moment(customStartDate).format('MMM D')} - ${moment(customEndDate).format('MMM D')}`}
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
              <li><a onClick={() => setDateFilter(DATE_FILTERS.ALL)}>All Time</a></li>
              <li><a onClick={() => setDateFilter(DATE_FILTERS.TODAY)}>Today</a></li>
              <li><a onClick={() => setDateFilter(DATE_FILTERS.YESTERDAY)}>Yesterday</a></li>
              <li><a onClick={() => setDateFilter(DATE_FILTERS.WEEK)}>This Week</a></li>
              <li><a onClick={() => setShowFilterModal(true)}>Custom Date Range...</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-grow flex overflow-hidden">
        {/* Posts List */}
        <div className="w-full md:w-1/3 lg:w-2/5 border-r border-base-300 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="p-6 text-center text-base-content/60">
              No posts found
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className={`card ${selectedPost?.id === post.id ? 'bg-base-300' : 'bg-base-100'} shadow hover:shadow-md cursor-pointer transition-colors`}
                  onClick={() => handleSelectPost(post)}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="card-title text-base font-bold break-words whitespace-normal">
                        {post.title}
                      </h3>
                      <div
                        className={`badge badge-sm shrink-0 ${ /* shrink-0 prevents the badge from being crushed */
                          post.status === 'open'
                            ? 'badge-success'
                            : post.status === 'in-progress'
                            ? 'badge-warning'
                            : 'badge-error'
                        }`}
                      >
                        {post.status}
                      </div>
                    </div>
                    <p className="text-sm text-base-content/70 mt-1 leading-snug line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex justify-between items-center mt-3 text-xs opacity-60">
                      <span className="flex items-center gap-1">
                        <BiUser /> {post.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <BiTime /> {moment(post.createdAt).fromNow()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Post Detail */}
        <div className="hidden md:block md:w-2/3 lg:w-3/5 overflow-y-auto">
          {selectedPost ? (
            <div className="p-6">
              <PostViewer 
                post={selectedPost} 
                isModal={false} 
                onBack={() => setSelectedPost(null)} 
              />
            </div>
          ) : (
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Forum at a Glance</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Needs Attention */}
                <div className="card bg-warning/10 border border-warning">
                  <div className="card-body">
                    <h3 className="font-semibold text-warning">Needs Attention</h3>
                    <p className="text-2xl font-bold">{posts.filter(p => p.status === 'open').length}</p>
                    <p className="text-sm opacity-70">open posts</p>
                  </div>
                </div>

                {/* In Progress */}
                <div className="card bg-info/10 border border-info">
                  <div className="card-body">
                    <h3 className="font-semibold text-info">In Progress</h3>
                    <p className="text-2xl font-bold">{posts.filter(p => p.status === 'in-progress').length}</p>
                    <p className="text-sm opacity-70">discussions ongoing</p>
                  </div>
                </div>

                {/* All Caught Up */}
                <div className="card bg-success/10 border border-success">
                  <div className="card-body">
                    <h3 className="font-semibold text-success">All Caught Up</h3>
                    <p className="text-2xl font-bold">{posts.filter(p => p.status === 'closed').length}</p>
                    <p className="text-sm opacity-70">resolved posts</p>
                  </div>
                </div>

                {/* Total Posts */}
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="font-semibold">Total Posts</h3>
                    <p className="text-2xl font-bold">{posts.length}</p>
                    <p className="text-sm opacity-70">in forum</p>
                  </div>
                </div>

                {/* My Posts */}
                {user && (
                  <div className="card bg-primary/10 border border-primary">
                    <div className="card-body">
                      <h3 className="font-semibold text-primary">My Posts</h3>
                      <p className="text-2xl font-bold">{posts.filter(p => p.authorId === user.uid).length}</p>
                      <p className="text-sm opacity-70">posts created</p>
                    </div>
                  </div>
                )}

                {/* Total Contributions (Replies) */}
                <div className="card bg-base-200">
                  <div className="card-body">
                    <h3 className="font-semibold">Total Contributions</h3>
                    <p className="text-2xl font-bold">{allReplies.length}</p>
                    <p className="text-sm opacity-70">total replies</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-base-content/60">
                <p>← Select a post from the left to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Modal */}
      {selectedPost && (
        <dialog className="modal modal-open md:hidden">
          <div className="modal-box w-11/12 max-w-5xl">
            <PostViewer 
              post={selectedPost} 
              isModal={true} 
              onBack={() => setSelectedPost(null)}
            />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedPost(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* New Post Modal */}
      <dialog id="new_post_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="space-y-6 p-6">
              <div className="form-control">
                <p className="label-text font-semibold mb-3">Title</p>
                <input 
                  type="text" 
                  name="title" 
                  className="input input-bordered" 
                  placeholder="Enter post title" 
                  required 
                  disabled={submitting}
                />
              </div>
              
              <div className="form-control">
                <p className="label-text font-semibold mb-3">Content</p>
                <textarea 
                  name="content" 
                  className="textarea textarea-bordered" 
                  rows="5" 
                  placeholder="Write your post..." 
                  required
                  disabled={submitting}
                ></textarea>
              </div>
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Posting...
                  </>
                ) : (
                  'Post Thread'
                )}
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => document.getElementById('new_post_modal').close()}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Edit Post Modal */}
      <dialog id="edit_post_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Edit Post</h3>
          <form onSubmit={handleUpdatePost}>
            <div className="space-y-6 p-6">
              <div className="form-control">
                <p className="label-text font-semibold mb-3">Title</p>
                <input 
                  type="text" 
                  className="input input-bordered" 
                  placeholder="Enter post title" 
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required 
                  disabled={submitting}
                />
              </div>
              
              <div className="form-control">
                <p className="label-text font-semibold mb-3">Content</p>
                <textarea 
                  className="textarea textarea-bordered" 
                  rows="5" 
                  placeholder="Write your post..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  required
                  disabled={submitting}
                ></textarea>
              </div>
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  'Update Post'
                )}
              </button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => {
                  document.getElementById('edit_post_modal').close()
                  setEditingPost(null)
                  setEditTitle('')
                  setEditContent('')
                }}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>

      {/* Filter Modal */}
      {showFilterModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-6">Custom Date Range</h3>
            <div className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Start Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">End Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setDateFilter(DATE_FILTERS.CUSTOM)
                  setShowFilterModal(false)
                }}
                disabled={!customStartDate || !customEndDate}
              >
                Apply
              </button>
              <button 
                className="btn" 
                onClick={() => setShowFilterModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )

  return <SideBar pageContent={pageContent} />
}

export default ForumPage
