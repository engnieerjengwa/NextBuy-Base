export interface ProductQuestion {
  id: number;
  productId: number;
  customerName: string;
  question: string;
  isAnswered: boolean;
  answers: ProductAnswer[];
  dateCreated: Date;
}

export interface ProductAnswer {
  id: number;
  questionId: number;
  answeredByName: string;
  answeredBySeller: boolean;
  answer: string;
  helpfulCount: number;
  dateCreated: Date;
}

export interface ProductQuestionRequest {
  productId?: number;
  question: string;
}

export interface ProductAnswerRequest {
  questionId?: number;
  answer: string;
}
