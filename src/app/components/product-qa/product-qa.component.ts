import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ProductQuestion,
  ProductQuestionRequest,
  ProductAnswerRequest,
} from '../../common/product-qa';
import { ProductQaService } from '../../services/product-qa.service';

@Component({
  selector: 'app-product-qa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-qa.component.html',
  styleUrl: './product-qa.component.css',
})
export class ProductQaComponent implements OnInit {
  @Input() productId!: number;

  questions: ProductQuestion[] = [];
  totalQuestions: number = 0;
  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;

  showQuestionForm: boolean = false;
  newQuestion: string = '';
  submittingQuestion: boolean = false;

  answeringQuestionId: number | null = null;
  newAnswer: string = '';
  submittingAnswer: boolean = false;

  isLoggedIn: boolean = false;
  errorMessage: string = '';

  constructor(
    private productQaService: ProductQaService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isLoggedIn = !!sessionStorage.getItem('userEmail');
    }
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.productQaService
      .getQuestionsByProductId(this.productId, this.currentPage, this.pageSize)
      .subscribe({
        next: (data) => {
          this.questions = data.content;
          this.totalQuestions = data.totalElements;
          this.totalPages = data.totalPages;
        },
        error: (err) => console.error('Error loading questions', err),
      });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadQuestions();
    }
  }

  toggleQuestionForm(): void {
    this.showQuestionForm = !this.showQuestionForm;
    if (!this.showQuestionForm) {
      this.newQuestion = '';
    }
  }

  askQuestion(): void {
    if (!this.newQuestion.trim()) {
      this.errorMessage = 'Please enter your question';
      return;
    }

    this.submittingQuestion = true;
    this.errorMessage = '';

    const request: ProductQuestionRequest = {
      question: this.newQuestion,
    };

    this.productQaService.askQuestion(this.productId, request).subscribe({
      next: () => {
        this.newQuestion = '';
        this.showQuestionForm = false;
        this.submittingQuestion = false;
        this.loadQuestions();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to submit question';
        this.submittingQuestion = false;
      },
    });
  }

  toggleAnswerForm(questionId: number): void {
    if (this.answeringQuestionId === questionId) {
      this.answeringQuestionId = null;
      this.newAnswer = '';
    } else {
      this.answeringQuestionId = questionId;
      this.newAnswer = '';
    }
  }

  submitAnswer(questionId: number): void {
    if (!this.newAnswer.trim()) return;

    this.submittingAnswer = true;

    const request: ProductAnswerRequest = {
      answer: this.newAnswer,
    };

    this.productQaService.answerQuestion(questionId, request).subscribe({
      next: () => {
        this.answeringQuestionId = null;
        this.newAnswer = '';
        this.submittingAnswer = false;
        this.loadQuestions();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Failed to submit answer';
        this.submittingAnswer = false;
      },
    });
  }

  markAnswerHelpful(answerId: number): void {
    this.productQaService.markAnswerHelpful(answerId).subscribe({
      next: () => this.loadQuestions(),
      error: (err) => console.error('Error marking helpful', err),
    });
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const d = new Date(date);
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }
}
