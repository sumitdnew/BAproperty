import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { CommunityPost } from '../lib/supabase'
import { useBuildingContext } from '../context/BuildingContext'

export const useCommunityPosts = () => {
  const { selectedBuilding } = useBuildingContext()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    if (!selectedBuilding) {
      setPosts([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('community_posts')
        .select(`
          *,
          user_profiles!community_posts_author_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('building_id', selectedBuilding.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform the data to include author names
      const postsWithNames = (data || []).map(post => ({
        ...post,
        author_name: post.user_profiles 
          ? `${post.user_profiles.first_name} ${post.user_profiles.last_name}`.trim()
          : 'Anonymous'
      }))

      setPosts(postsWithNames)
    } catch (err) {
      console.error('Error fetching community posts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch posts')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (postData: {
    title: string
    content: string
    post_type: string
    category?: string
    is_pinned: boolean
  }) => {
    if (!selectedBuilding) {
      throw new Error('No building selected')
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error('User not authenticated')
      }

      const { data, error: insertError } = await supabase
        .from('community_posts')
        .insert({
          building_id: selectedBuilding.id,
          author_id: userData.user.id,
          title: postData.title,
          content: postData.content,
          post_type: postData.post_type,
          category: postData.category,
          is_pinned: postData.is_pinned,
          likes_count: 0,
          comments_count: 0
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Add the new post to the beginning of the list
      setPosts(prev => [data, ...prev])
    } catch (err) {
      console.error('Error creating post:', err)
      throw err
    }
  }

  const likePost = async (postId: string) => {
    try {
      console.log('Liking post:', postId)
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }
      if (!userData.user) {
        throw new Error('User not authenticated')
      }
      console.log('User authenticated:', userData.user.id)

      // Check if user already liked this post
      const { data: existingLike, error: likeCheckError } = await supabase
        .from('community_post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userData.user.id)
        .maybeSingle()

      if (likeCheckError) {
        console.error('Error checking existing like:', likeCheckError)
        throw likeCheckError
      }

      if (existingLike) {
        // Unlike the post
        const { error: deleteError } = await supabase
          .from('community_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userData.user.id)

        if (deleteError) throw deleteError

        // Decrease likes count
        const currentPost = posts.find(p => p.id === postId)
        const newLikesCount = Math.max(0, (currentPost?.likes_count || 0) - 1)
        const { error: updateError } = await supabase
          .from('community_posts')
          .update({ likes_count: newLikesCount })
          .eq('id', postId)

        if (updateError) throw updateError

        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
            : post
        ))
      } else {
        // Like the post
        console.log('Inserting like for post:', postId, 'user:', userData.user.id)
        const { error: insertError } = await supabase
          .from('community_post_likes')
          .insert({
            post_id: postId,
            user_id: userData.user.id
          })

        if (insertError) {
          console.error('Error inserting like:', insertError)
          throw insertError
        }

        // Increase likes count
        const currentPost = posts.find(p => p.id === postId)
        const newLikesCount = (currentPost?.likes_count || 0) + 1
        const { error: updateError } = await supabase
          .from('community_posts')
          .update({ likes_count: newLikesCount })
          .eq('id', postId)

        if (updateError) throw updateError

        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ))
      }
    } catch (err) {
      console.error('Error liking post:', err)
      throw err
    }
  }

  const addComment = async (postId: string, content: string) => {
    try {
      console.log('Adding comment to post:', postId, 'Content:', content)
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError) {
        console.error('Auth error:', authError)
        throw authError
      }
      if (!userData.user) {
        throw new Error('User not authenticated')
      }
      console.log('User authenticated:', userData.user.id)

      // Insert comment
      console.log('Inserting comment for post:', postId, 'user:', userData.user.id, 'content:', content)
      const { error: insertError } = await supabase
        .from('community_post_comments')
        .insert({
          post_id: postId,
          author_id: userData.user.id,
          content: content
        })

      if (insertError) {
        console.error('Error inserting comment:', insertError)
        throw insertError
      }

      // Increase comments count
      const currentPost = posts.find(p => p.id === postId)
      const newCommentsCount = (currentPost?.comments_count || 0) + 1
      const { error: updateError } = await supabase
        .from('community_posts')
        .update({ comments_count: newCommentsCount })
        .eq('id', postId)

      if (updateError) {
        throw updateError
      }

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ))
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [selectedBuilding])

  return {
    posts,
    loading,
    error,
    createPost,
    likePost,
    addComment,
    refetch: fetchPosts
  }
}
