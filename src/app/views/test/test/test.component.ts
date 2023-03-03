import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TestService } from '../../../shared/services/test.service';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { QuizType } from '../../../../types/quiz.type';
import { ActionTestType } from '../../../../types/action-test.type';
import { UserResultType } from '../../../../types/user-result.type';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
})
export class TestComponent implements OnInit {
  quiz!: QuizType;
  timerSeconds: number = 59;
  currentQuestionIndex: number = 1;
  chosenAnswerId: number | null = null;
  actionTestType = ActionTestType;
  readonly userResult: UserResultType[] = [];
  private interval: number = 0;

  constructor(
    private activatedRoute: ActivatedRoute,
    private testService: TestService,
    private authService: AuthService,
    private router: Router
  ) {}

  get activeQuestion() {
    return this.quiz.questions[this.currentQuestionIndex - 1];
  }

  startQuiz(): void {
    this.interval = window.setInterval(() => {
      this.timerSeconds--;
      if (this.timerSeconds === 0) {
        clearInterval(this.interval);
        this.complete();
      }
    }, 1000);
  }

  complete(): void {
    const userInfo = this.authService.getUserInfo();

    if (userInfo) {
      this.testService
        .passQuiz(this.quiz.id, userInfo.userId, this.userResult)
        .subscribe((response) => {
          if (response) {
            if ((response as DefaultResponseType).error !== undefined) {
              throw new Error((response as DefaultResponseType).message);
            }

            this.router.navigate(['/result'], {
              queryParams: { id: this.quiz.id },
            });
          }
        });
    }
  }

  move(action: ActionTestType): void {
    const existingResult: UserResultType | undefined = this.userResult.find(
      (item: UserResultType) => {
        return item.questionId === this.activeQuestion.id;
      }
    );

    if (this.chosenAnswerId) {
      if (existingResult) {
        existingResult.chosenAnswerId = this.chosenAnswerId;
      } else {
        this.userResult.push({
          questionId: this.activeQuestion.id,
          chosenAnswerId: this.chosenAnswerId,
        });
      }
    }

    if (action === ActionTestType.next || action === ActionTestType.pass) {
      if (this.currentQuestionIndex === this.quiz.questions.length) {
        clearInterval(this.interval);
        this.complete();
        return;
      }

      this.currentQuestionIndex++;
    } else {
      this.currentQuestionIndex--;
    }

    const currentResult: UserResultType | undefined = this.userResult.find(
      (item: UserResultType) => {
        return item.questionId === this.activeQuestion.id;
      }
    );
    if (currentResult) {
      this.chosenAnswerId = currentResult.chosenAnswerId;
    }
  }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.testService.getQuiz(params['id']).subscribe((response) => {
          if (response) {
            if ((response as DefaultResponseType).error !== undefined) {
              throw new Error((response as DefaultResponseType).message);
            }

            this.quiz = response as QuizType;
            this.startQuiz();
          }
        });
      }
    });
  }
}
