import databaseService from './database.services'

class SearchService {
  async search({ content, limit, page }: { content: string; limit: number; page: number }) {
    const data = await databaseService.tweets
      .find({
        $text: {
          $search: content
        }
      })
      .skip(limit * (page - 1))
      .limit(limit)
      .toArray()

    return data
  }
}

const searchService = new SearchService()
export default searchService
