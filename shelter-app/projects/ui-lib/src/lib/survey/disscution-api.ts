import {Observable} from 'rxjs';
import {TitleType} from '../i18n';

export interface VoteMe {
  vote?: string;
}
export interface VoteAll {
  vote?: string;
  count?: number;
}
export interface VoteType {
  voteId?: number;
  me?: VoteMe;
  all: VoteAll;
}

/**
 * This interface is used by VoteComponent and DiscussionComponent
 */
export interface VoteOption {
  icon: string; // gm-icon name
  option: string; // name of option that will calculated
  title: TitleType[];
}
export interface CommentType {
  id: string;
  created: string;
  nickName: string;
  comment: string;
  vote: VoteType[];
  expand?: boolean;
  isMy: boolean;
  numberOf?: number; // this field contain number of responses to this comment it can be more than responses.length
  responses: Array<CommentType>;
}
export interface CommentResponse {
  lastComment: string;
  numberOf: number; // this field contain number of all responses it can be more than responses.length
  vote?: VoteType[];
  responses: Array<CommentType>;
}
export interface SurveysMediator {
  /**
   * Obtain result of survey
   * @param resourceId - resource ID that contain this vote component
   * @param voteId - the ID of vote component in this resource, if need to obtain separately
   */
  getVotes: (resourceId: string, voteId?: number) => Observable<VoteType[]>;
  /**
   * vote
   * @param resourceId - resource ID that contain this vote component
   * @param vote - result of voting
   * @param voteId - the ID of vote component in this resource, if resource has more than one vote component
   */
  vote: (resourceId: string, vote: string, voteId?: number) => Observable<any>;
}
export interface DiscussionMediator extends SurveysMediator {
  /**
   * gie all comments for resource
   * @param resourceId - resource ID
   * @param size - number of records
   * @param from - from position
   * @param commentId - comment ID of this resource
   */
  getComment: (resourceId: string, size?: number, from?: number, commentId?: string) => Observable<CommentResponse>;
  /**
   * add comment to resource
   * @param resourceId - resource ID
   * @param comment - text of the comment
   * @param nickName - nick name
   * @param commentId - comment ID if a comment is commented
   */
  addComment: (resourceId: string, comment: string, nickName?: string, commentId?: string) => Observable<any>;
  /**
   * update comment
   * @param resourceId - resource ID (maybe redundant)
   * @param comment - test of the comment
   * @param commentId - comment ID what is updated
   */
  updateComment: (resourceId: string, comment: string, commentId: string) => Observable<any>;
}
