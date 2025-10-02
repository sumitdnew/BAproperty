import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBuildingContext } from '../context/BuildingContext'
import { useCommunityPosts } from '../hooks/useCommunityPosts'
import PostCard from '../components/Community/PostCard'
import PostForm from '../components/Community/PostForm'

const Community: React.FC = () => {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingContext()
  const { posts, loading, error, createPost, likePost, addComment } = useCommunityPosts()
  const [showPostForm, setShowPostForm] = useState(false)


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading community posts: {error}</p>
      </div>
    )
  }

  const pinnedPosts = posts.filter(post => post.is_pinned)
  const regularPosts = posts.filter(post => !post.is_pinned)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('community')}</h1>
          <p className="text-gray-600">
            {selectedBuilding ? `${t('postsFrom')} ${selectedBuilding.name}` : t('selectBuildingToViewPosts')}
          </p>
        </div>
        {selectedBuilding && (
          <button
            onClick={() => setShowPostForm(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
{t('newPost')}
        </button>
        )}
      </div>

      {/* Post Form Modal */}
      {showPostForm && (
        <PostForm
          onClose={() => setShowPostForm(false)}
          onSubmit={createPost}
        />
      )}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
              </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noPostsYet')}</h3>
          <p className="text-gray-500 mb-4">
            {selectedBuilding 
              ? t('beFirstToShare') 
              : t('selectBuildingToCreatePosts')
            }
          </p>
          {selectedBuilding && (
            <button
              onClick={() => setShowPostForm(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
{t('createFirstPost')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Posts */}
          {pinnedPosts.length > 0 && (
                <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-coral-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
{t('pinnedPosts')}
              </h2>
              <div className="space-y-4">
                {pinnedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={likePost}
                    onComment={addComment}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          {regularPosts.length > 0 && (
                <div>
              {pinnedPosts.length > 0 && (
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('recentPosts')}</h2>
              )}
              <div className="space-y-4">
                {regularPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={likePost}
                    onComment={addComment}
                  />
            ))}
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  )
}

export default Community