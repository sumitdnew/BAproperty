import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useBuildingContext } from '../../context/BuildingContext'

interface PostFormProps {
  onClose: () => void
  onSubmit: (postData: {
    title: string
    content: string
    post_type: string
    category?: string
    is_pinned: boolean
  }) => Promise<void>
}

const PostForm: React.FC<PostFormProps> = ({ onClose, onSubmit }) => {
  const { t } = useTranslation()
  const { selectedBuilding } = useBuildingContext()
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    post_type: 'announcement',
    category: '',
    is_pinned: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const postTypes = [
    { value: 'announcement', label: t('announcement'), description: t('announcementDescription') },
    { value: 'maintenance', label: t('maintenance'), description: t('maintenanceDescription') },
    { value: 'social', label: t('social'), description: t('socialDescription') },
    { value: 'complaint', label: t('complaint'), description: t('complaintDescription') },
    { value: 'question', label: t('question'), description: t('questionDescription') }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        title: formData.title.trim(),
        content: formData.content.trim(),
        post_type: formData.post_type,
        category: formData.category.trim() || undefined,
        is_pinned: formData.is_pinned
      })
      onClose()
    } catch (error) {
      console.error('Error creating post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('createNewPost')}</h2>
            <p className="text-sm text-gray-600">
              {selectedBuilding ? `${t('postingTo')} ${selectedBuilding.name}` : t('selectBuildingToPost')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Post Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t('postType')}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {postTypes.map((type) => (
                <label key={type.value} className="relative">
                  <input
                    type="radio"
                    name="post_type"
                    value={type.value}
                    checked={formData.post_type === type.value}
                    onChange={(e) => handleChange('post_type', e.target.value)}
                    className="sr-only"
                  />
                  <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.post_type === type.value
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{type.label}</h3>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        formData.post_type === type.value
                          ? 'border-orange-500 bg-orange-500'
                          : 'border-gray-300'
                      }`}>
                        {formData.post_type === type.value && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              {t('title')} *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('enterPostTitle')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              {t('category')} ({t('optional')})
            </label>
            <input
              type="text"
              id="category"
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              placeholder={t('categoryPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              {t('content')} *
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder={t('writePostContent')}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              required
            />
          </div>

          {/* Pin Post */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_pinned"
              checked={formData.is_pinned}
              onChange={(e) => handleChange('is_pinned', e.target.checked)}
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="is_pinned" className="ml-2 block text-sm text-gray-700">
              {t('pinThisPost')}
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
{t('cancel')}
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || !formData.content.trim() || isSubmitting}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
{isSubmitting ? t('creating') : t('createPost')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostForm
