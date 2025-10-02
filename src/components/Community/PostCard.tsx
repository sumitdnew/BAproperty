import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../../lib/supabase'
import type { CommunityPost } from '../../lib/supabase'

interface Comment {
  id: string
  post_id: string
  author_id: string | null
  content: string
  created_at: string
  author_name?: string
}

interface PostCardProps {
  post: CommunityPost
  onLike: (postId: string) => void
  onComment: (postId: string, content: string) => void
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
  const { t } = useTranslation()
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  const fetchComments = async () => {
    try {
      setLoadingComments(true)
      const { data, error } = await supabase
        .from('community_post_comments')
        .select(`
          *,
          user_profiles!community_post_comments_author_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error fetching comments:', error)
        return
      }

      // Transform the data to include author names
      const commentsWithNames = (data || []).map(comment => ({
        ...comment,
        author_name: comment.user_profiles 
          ? `${comment.user_profiles.first_name} ${comment.user_profiles.last_name}`.trim()
          : 'Anonymous'
      }))

      setComments(commentsWithNames)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      await onComment(post.id, newComment.trim())
      setNewComment('')
      // Refresh comments after adding a new one
      await fetchComments()
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return t('justNow')
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return t('yesterday')
    return date.toLocaleDateString()
  }

  // Fetch comments when comments section is opened
  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments()
    }
  }, [showComments])

  const getPostTypeColor = (postType: string) => {
    switch (postType.toLowerCase()) {
      case 'announcement':
        return 'bg-blue-100 text-blue-800'
      case 'maintenance':
        return 'bg-orange-100 text-orange-800'
      case 'social':
        return 'bg-green-100 text-green-800'
      case 'complaint':
        return 'bg-red-100 text-red-800'
      case 'question':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPostTypeLabel = (postType: string) => {
    switch (postType.toLowerCase()) {
      case 'announcement':
        return t('announcement')
      case 'maintenance':
        return t('maintenance')
      case 'social':
        return t('socialEvents')
      case 'complaint':
        return t('complaints')
      case 'question':
        return t('question')
      default:
        return postType
    }
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${post.is_pinned ? 'border-coral-200 bg-coral-50' : 'border-gray-200'}`}>
      {/* Post Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-coral-100 rounded-full flex items-center justify-center">
              <span className="text-coral-600 font-semibold text-sm">
                {post.author_name ? post.author_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'A'}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-gray-900">
                  {post.author_name || 'Anonymous'}
                </h3>
                {post.is_pinned && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-coral-100 text-coral-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    {t('pinned')}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatDate(post.created_at)}</span>
                <span>•</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.post_type)}`}>
                  {getPostTypeLabel(post.post_type)}
                </span>
                {post.category && (
                  <>
                    <span>•</span>
                    <span className="text-gray-500">{post.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h2>
        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <button
              onClick={async () => {
                try {
                  await onLike(post.id)
                } catch (error) {
                  console.error('Error liking post:', error)
                }
              }}
              className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-sm font-medium">{post.likes_count}</span>
            </button>

            {/* Comment Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-medium">{post.comments_count}</span>
            </button>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-semibold text-xs">U</span>
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={t('writeComment')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={!newComment.trim() || isSubmittingComment}
                      className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      {isSubmittingComment ? t('posting') : t('postComment')}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-3">
              {loadingComments ? (
                <div className="text-center py-4 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                  <p className="mt-2">{t('loadingComments')}</p>
                </div>
              ) : comments.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>{t('commentsWillAppear')}</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-xs">
                        {comment.author_name ? comment.author_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
                          <span className="font-medium">
                            {comment.author_name || 'Anonymous'}
                          </span>
                          <span>•</span>
                          <span>{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="text-gray-700 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostCard
