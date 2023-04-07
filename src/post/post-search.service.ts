import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PostSearchResult } from './interface/post-search-result.interface';
import { PostSearchBody } from './interface/post-search-body.interface';
import Post from 'src/entity/post.entity';

@Injectable()
export default class PostsSearchService {
  index = 'posts';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async indexPost(post: Post) {
    return this.elasticsearchService.index<PostSearchBody>({
      index: this.index,
      body: {
        id: post.id,
        title: post.title,
        content: post.content,
        authorId: post.author.id
      }
    });
  }

  async search(text: string, offset: number, limit: number) {
    const response = await this.elasticsearchService.search<PostSearchResult>({
      index: this.index,
      from: offset,
      size: limit,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['title', 'content']
          }
        }
      }
    });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const count = response.body.hits.total.value;
    const hits = response.body.hits.hits;
    const result = hits.map((item) => item._source);

    return {
      count,
      result
    };
  }
}
