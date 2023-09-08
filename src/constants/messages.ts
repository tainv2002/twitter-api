import { MediaTypeQuery, PeopleFollowedQuery } from './enums'

export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Password must be from 6 to 50 characters',
  PASSWORD_MUST_BE_STRONG:
    'Password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50: 'Confirm password must be from 6 to 50 characters',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be 6-50 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_A_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO 8601',
  LOGIN_SUCCESSFUL: 'Login successful',
  REGISTER_SUCCESSFUL: 'Register successful',
  LOGOUT_SUCCESSFUL: 'Logout successful',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  ACCESS_TOKEN_IS_INVALID: 'Access token is invalid',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_INVALID: 'Refresh token is invalid',
  REFRESH_TOKEN_HAS_BEEN_USED_OR_DOES_NOT_EXIST: 'Refresh token has been used or does not exist',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  EMAIL_ALREADY_VERIFIED: 'Email already verified',
  VERIFY_EMAIL_SUCCESSFULLY: 'Verify email successfully',
  RESEND_VERIFICATION_EMAIL_SUCCESSFULLY: 'Resend verification email successfully',
  CHECK_EMAIL_TO_RESET_PASSWORD: 'Check email to reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_IS_INVALID: 'Forgot password token is invalid',
  VERIFY_FORGOT_PASSWORD_SUCCESSFULLY: 'Verify forgot password successfully',
  RESET_PASSWORD_SUCCESSFULLY: 'Reset password successfully',
  GET_ME_SUCCESSFULLY: 'Get me successfully',
  USER_NOT_VERIFIED: 'User not verified',
  UPDATE_ME_SUCCESSFULLY: 'Update me successfully',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_FROM_1_TO_200: 'Bio length must be from 1 to 200',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_FROM_1_TO_200: 'Location length must be from 1 to 200',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_FROM_1_TO_200: 'Website length must be from 1 to 200',
  USERNAME_IS_INVALID: 'Username must be 4-15 characters long and contain only letters, numbers, and underscores',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_50: 'Username length must be from 1 to 50',
  USERNAME_ALREADY_EXISTED: 'Username already existed',
  IMAGE_URL_MUST_BE_A_STRING: 'Image url must be a string',
  IMAGE_URL_LENGTH_MUST_BE_FROM_1_TO_200: 'Image url length must be from 1 to 200',
  GET_PROFILE_SUCCESSFULLY: 'Get profile successfully',
  FOLLOW_AN_USER_SUCCESSFULLY: 'Follow an user successfully',
  ALREADY_FOLLOWED: 'Already followed',
  ALREADY_UNALREADY_FOLLOWED: 'Already unfollowed',
  UNFOLLOW_AN_USER_SUCCESSFULLY: 'Unfollow an user successfully',
  INVALID_USER_ID: 'Invalid user id',
  OLD_PASSWORD_NOT_MATCH: 'Old password not match',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Change password successfully',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  UPLOAD_IMAGE_SUCCESSFULLY: 'Upload image successfully',
  UPLOAD_VIDEO_SUCCESSFULLY: 'Upload video successfully',
  GET_VIDEO_STATUS_SUCCESSFULLY: 'Get video status successfully'
} as const

export const TWEETS_MESSAGES = {
  TYPE_IS_REQUIRED: 'Type is required',
  TYPE_IS_INVALID: 'Type is invalid',
  AUDIENCE_IS_INVALID: 'Audience is invalid',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent id must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_BE_A_STRING: 'Content must be a string',
  CONTENT_MUST_BE_A_NON_EMPTY_STRING: 'Content must be a non empty string',
  CONTENT_MUST_BE_EMPTY_STRING: 'Content must be empty string',
  HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING: 'Hashtags must be an array of string',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user id',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT: 'Medias must be an array of media object',
  CREATE_TWEET_SUCCESSFULLY: 'Create tweet successfully',
  TWEET_ID_IS_INVALID: 'Tweet ID is invalid',
  TWEET_NOT_FOUND: 'Tweet not found',
  GET_TWEET_SUCCESSFULLY: 'Get tweet successfully',
  GET_TWEET_CHILDREN_SUCCESSFULLY: 'Get tweet children successfully',
  TWEET_IS_NOT_PUBLIC: 'Tweet is not public',
  INVALID_TWEET_TYPE: 'Invalid tweet type',
  PAGE_MUST_BE_GREATER_THAN_0: 'Page must be greater than 0',
  LIMIT_MUST_BE_GREATER_THAN_0_AND_LESS_THAN_100: 'Limit must be greater than 0 and less than 100',
  GET_NEW_FEEDS_SUCCESSFULLY: 'Get new feeds successfully'
}

export const BOOKMARKS_MESSAGE = {
  BOOKMARK_ID_IS_INVALID: 'Bookmark ID is invalid',
  BOOKMARK_NOT_FOUND: 'Bookmark not found',
  BOOKMARK_TWEET_SUCCESSFULLY: 'Bookmark tweet successfully',
  UNBOOKMARK_TWEET_SUCCESSFULLY: 'Unbookmark tweet successfully'
}

export const SEARCH_MESSAGES = {
  SEARCH_SUCCESSFULLY: 'Search successfully',
  CONTENT_MUST_BE_A_STRING: 'Content must be a string',
  INVALID_MEDIA_TYPE: `Media type must be one of ${Object.values(MediaTypeQuery).join('/')}`,
  INVALID_PEOPLE_FOLLOWED: `People follow must be one of ${Object.values(PeopleFollowedQuery).join('/')}`
}

export const CONVERSATIONS_MESSAGE = {
  INVALID_RECEIVER_ID: 'Invalid Receiver ID',
  RECEIVER_NOT_FOUND: 'Receiver not found',
  GET_CONVERSATIONS_BY_RECEIVER_ID_SUCCESSFULLY: 'Get conversations by receiver id successfully'
}
