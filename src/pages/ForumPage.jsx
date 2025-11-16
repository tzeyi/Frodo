import { useState } from 'react'
import SideBar from '../components/SideBar'
import { 
  BiUser, 
  BiTime, 
  BiCommentDots, 
  BiPlus,
  BiCollection, 
  BiMessageCheck, 
  BiMessageError, 
  BiMessageDetail
} from 'react-icons/bi'

// Mock data (no changes)
const mockPosts = [
  { 
    id: 1, 
    title: 'Welcome to the Forum!', 
    author: 'Admin', 
    authorAvatar: 'A', 
    date: '2025-11-15', 
    status: 'closed',
    content: 'Welcome everyone! This is the place for general discussion, questions, and coordinating efforts.\n\nPlease be respectful and keep discussions on topic.',
    replies: [
      { id: 101, author: 'JaneD', authorAvatar: 'J', date: '2025-11-15', content: 'Great to be here!' },
      { id: 102, author: 'MikeB', authorAvatar: 'M', date: '2025-11-16', content: 'Thanks for setting this up.' }
    ]
  },
  { 
    id: 2, 
    title: 'Need volunteers for upcoming food drive', 
    author: 'ProjectCoordinator', 
    authorAvatar: 'P', 
    date: '2025-11-14', 
    status: 'in-progress',
    content: 'We are organizing a food drive next weekend at the community center. We need 10 volunteers for sorting and distribution.\n\nSign-ups are here: [link]',
    replies: [
      { id: 103, author: 'Volunteer1', authorAvatar: 'V', date: '2025-11-14', content: 'I can help on Saturday!' },
      { id: 104, author: 'MikeB', authorAvatar: 'M', date: '2025-11-15', content: "I'll bring a friend." },
      { id: 105, author: 'JaneD', authorAvatar: 'J', date: '2025-11-15', content: 'What time do you need people?' },
      { id: 106, author: 'ProjectCoordinator', authorAvatar: 'P', date: '2025-11-15', content: '@JaneD 9am to 3pm.' },
      { id: 107, author: 'MikeB', authorAvatar: 'M', date: '2025-11-16', content: 'Count me in for 9am.' }
    ]
  },
  { 
    id: 3, 
    title: 'Request: Blankets and warm clothes', 
    author: 'ShelterManager', 
    authorAvatar: 'S', 
    date: '2025-11-13', 
    status: 'open',
    content: 'Our shelter is running low on blankets and warm clothing for the winter season. Donations can be dropped off at our main location.',
    replies: [] 
  },
]

// --- Reusable Stat Card Component ---
const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="card bg-base-100 shadow-md">
    <div className="card-body p-4">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClass || 'bg-primary/20 text-primary'}`}>
          {icon}
        </div>
        <div className="ml-4">
          <div className="text-sm font-medium text-base-content/70">{title}</div>
          <div className="text-2xl font-bold text-base-content">{value}</div>
        </div>
      </div>
    </div>
  </div>
);

// --- 1. NEW DASHBOARD COMPONENT ---
const ForumDashboard = ({ posts, onSelectPost }) => {
  // Calculate statistics
  const openPosts = posts.filter(p => p.status === 'open');
  const postsNeedingReply = posts.filter(p => p.replies.length === 0 && p.status !== 'closed');
  const totalPosts = posts.length;
  const totalContributions = posts.reduce((acc, post) => acc + post.replies.length, 0) + totalPosts;
  const allCaughtUp = openPosts.length === 0 && postsNeedingReply.length === 0;

  return (
    <div className="p-6 h-full">
      <h2 className="text-2xl font-bold mb-6">Forum at a Glance</h2>
      
      {/* Top status cards */}
      {allCaughtUp ? (
        <div className="alert alert-success shadow-lg mb-6">
          <BiMessageCheck className="h-6 w-6" />
          <span>You're all caught up! All posts have replies.</span>
        </div>
      ) : (
        <div className="alert alert-warning shadow-lg mb-6">
          <BiMessageError className="h-6 w-6" />
          <span>
            {openPosts.length > 0 ? `${openPosts.length} open post(s) need attention` : 'Posts need attention'}
          </span>
        </div>
      )}

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatCard
          title="Open Posts"
          value={openPosts.length}
          icon={<BiMessageError className="h-5 w-5" />}
          colorClass="bg-error/20 text-error"
        />
        <StatCard
          title="Posts Needing Reply"
          value={postsNeedingReply.length}
          icon={<BiMessageDetail className="h-5 w-5" />}
          colorClass="bg-warning/20 text-warning"
        />
        <StatCard
          title="Total Posts"
          value={totalPosts}
          icon={<BiCollection className="h-5 w-5" />}
        />
        <StatCard
          title="Total Contributions"
          value={totalContributions}
          icon={<BiCommentDots className="h-5 w-5" />}
        />
      </div>
      
      {/* List of posts needing attention */}
      {postsNeedingReply.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Posts Needing Reply</h3>
          <div className="card bg-base-100 shadow-md">
            <div className="list list-flush p-2">
              {postsNeedingReply.map(post => (
                <button 
                  key={post.id}
                  className="list-row text-left hover:bg-base-200"
                  onClick={() => onSelectPost(post)}
                >
                  <span className="truncate">{post.title}</span>
                  <span className="text-xs text-base-content/60">{post.author}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// --- ReplySection Component (no changes) ---
const ReplySection = ({ post, onAddReply }) => {
  const [replyText, setReplyText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onAddReply(post.id, replyText);
      setReplyText(''); 
    }
  };

  return (
    <div className="mt-6">
      <div className="divider">Replies ({post.replies.length})</div>
      <div className="space-y-4">
        {post.replies.map(reply => (
          <div key={reply.id} className="card bg-base-200 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center gap-3">
                <div className="avatar placeholder">
                  <div className="bg-neutral-focus text-neutral-content rounded-full w-8">
                    <span>{reply.authorAvatar}</span>
                  </div>
                </div>
                <div>
                  <span className="font-semibold">{reply.author}</span>
                  <span className="text-xs text-base-content/70 ml-2">{reply.date}</span>
                </div>
              </div>
              <p className="text-base-content/90 mt-2 ml-11">{reply.content}</p>
            </div>
          </div>
        ))}
        {post.replies.length === 0 && (
          <p className="text-sm text-center text-base-content/60">No replies yet.</p>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="form-control">
          <label className="label">
            <span className="label-text font-semibold">Post a Reply</span>
          </label>
          <textarea
            className="textarea textarea-bordered h-24"
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          ></textarea>
        </div>
        <div className="modal-action">
          <button type="submit" className="btn btn-primary">
            <BiCommentDots className="mr-2" />
            Post Reply
          </button>
        </div>
      </form>
    </div>
  );
};


function ForumPage() {
  const [posts, setPosts] = useState(mockPosts)
  const [selectedPost, setSelectedPost] = useState(null)

  const updatePostStatus = (postId, newStatus) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, status: newStatus } : post
      )
    );
    setSelectedPost((prevSelected) =>
      prevSelected.id === postId ? { ...prevSelected, status: newStatus } : prevSelected
    );
  };

  // --- BUG FIX ---
  // Updated handleCreatePost to use `replies: []`
  const handleCreatePost = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newPost = {
      id: new Date().getTime(), // Use timestamp for more unique ID
      title: formData.get('title'),
      author: 'CurrentUser', 
      authorAvatar: 'U',
      date: new Date().toISOString().split('T')[0],
      status: formData.get('status') || 'open',
      content: formData.get('message'),
      replies: [] // New posts start with an empty replies array
    }
    setPosts([newPost, ...posts])
    document.getElementById('new_post_modal').close()
    e.target.reset()
    setSelectedPost(newPost); // Automatically select the new post
  }

  const handleAddReply = (postId, replyContent) => {
    const newReply = {
      id: new Date().getTime(), 
      author: 'CurrentUser', 
      authorAvatar: 'U',
      date: new Date().toISOString().split('T')[0],
      content: replyContent,
    };
    let updatedPost = null;
    const newPosts = posts.map(post => {
      if (post.id === postId) {
        updatedPost = {
          ...post,
          replies: [...post.replies, newReply]
        };
        return updatedPost;
      }
      return post;
    });
    setPosts(newPosts);
    setSelectedPost(updatedPost); 
  };

  // This is the reusable component for viewing a post
  const PostViewer = ({ post, isModal }) => (
    <>
      <h3 className="font-bold text-lg">{post.title}</h3>
      
      <div className="py-4">
        <div className="flex flex-wrap items-center gap-4 text-sm opacity-70 mb-4 border-b pb-4">
          <div className="flex items-center gap-1"><BiUser /> {post.author}</div>
          <div className="flex items-center gap-1"><BiTime /> {post.date}</div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base-content/70">Status:</span>
            {/* --- COLOR FIX --- */}
            <span
              className={`badge ${
                post.status === 'open'
                  ? 'badge-success'
                  : post.status === 'in-progress'
                  ? 'badge-warning'
                  : 'badge-error'
              }`}
            >
              {post.status}
            </span>
          </div>
        </div>
        
        <p className="text-base-content/90 whitespace-pre-wrap">{post.content}</p>
        
        <ReplySection post={post} onAddReply={handleAddReply} />
      </div>
      
      <div className="modal-action mt-0 pt-0">
        {post.status === 'open' && (
          <button
            className="btn btn-warning"
            onClick={() => updatePostStatus(post.id, 'in-progress')}
          >
            Mark In Progress
          </button>
        )}
        {post.status === 'in-progress' && (
          <button
            className="btn btn-success"
            onClick={() => updatePostStatus(post.id, 'closed')}
          >
            Mark Closed
          </button>
        )}
        {post.status === 'closed' && (
          <button
            className="btn btn-error"
            onClick={() => updatePostStatus(post.id, 'open')}
          >
            Re-open Post
          </button>
        )}

        {isModal && (
          <button className="btn btn-ghost" onClick={() => setSelectedPost(null)}>
            Close
          </button>
        )}
      </div>
    </>
  );

  const pageContent = (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center p-5 border-b border-base-300">
        <h1 className="text-3xl font-bold text-primary">Forum</h1>
        <button 
          className="btn btn-primary"
          onClick={() => document.getElementById('new_post_modal').showModal()}
        >
          <BiPlus className="h-5 w-5" />
          Create New Post
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* Left Column: Post List */}
        <div className="w-full md:w-1/3 lg:w-2/5 border-r border-base-300 overflow-y-auto">
          <div className="space-y-2 p-2">
            {posts.map((post) => {
              const replyCount = post.replies.length;
              const lastReply = replyCount > 0 ? post.replies[replyCount - 1] : null;

              return (
                <div
                  key={post.id}
                  className={`card ${selectedPost?.id === post.id ? 'bg-base-300' : 'bg-base-100'} shadow hover:shadow-md cursor-pointer transition-colors`}
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title text-base font-bold">{post.title}</h3>
                      {/* --- COLOR FIX --- */}
                      <div
                        className={`badge badge-sm ${
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
                    <p className="text-sm text-base-content/70 mt-1 leading-snug">
                      {post.content.substring(0, 100)}{post.content.length > 100 ? '...' : ''}
                    </p>
                    <div className="flex justify-between items-center mt-3 text-xs opacity-60">
                      <span className="flex items-center gap-1"><BiUser /> {post.author}</span>
                      {lastReply ? (
                        <span className="flex items-center gap-1" title={`Last reply by ${lastReply.author}`}>
                          <BiCommentDots /> {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1"><BiCommentDots /> No replies</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Post Viewer (Desktop) */}
        <div className="hidden md:block md:w-2/3 lg:w-3/5 overflow-y-auto">
          {/* --- 2. DASHBOARD INTEGRATION --- */}
          {selectedPost ? (
            <div className="p-6">
              <PostViewer post={selectedPost} isModal={false} />
            </div>
          ) : (
            <ForumDashboard posts={posts} onSelectPost={setSelectedPost} />
          )}
        </div>
      </div>

      {/* Mobile Modal Viewer */}
      {selectedPost && (
        <dialog className="modal modal-open md:hidden">
          <div className="modal-box w-11/12 max-w-5xl">
            <PostViewer post={selectedPost} isModal={true} />
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setSelectedPost(null)}>close</button>
          </form>
        </dialog>
      )}

      {/* New Post Modal */}
      <dialog id="new_post_modal" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Create New Forum Post</h3>
          <form onSubmit={handleCreatePost}>
            <div className="space-y-4 py-4">
              <div className="form-control">
                <label className="label"><span className="label-text">Title</span></label>
                <input type="text" name="title" className="input input-bordered" placeholder="Enter post title" required />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Status</span></label>
                <select name="status" className="select select-bordered" defaultValue="open">
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Message</span></label>
                <textarea name="message" className="textarea textarea-bordered" rows="5" placeholder="Write your post..." required></textarea>
              </div>
            </div>
            <div className="modal-action">
              <button type="submit" className="btn btn-primary">Post Thread</button>
              <button 
                type="button" 
                className="btn" 
                onClick={() => document.getElementById('new_post_modal').close()}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )

  return <SideBar pageContent={pageContent} />
}

export default ForumPage