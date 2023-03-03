import { Component, OnInit } from '@angular/core';
import { TestService } from '../../../shared/services/test.service';
import { QuizListType } from '../../../../types/quiz-list.type';
import { AuthService } from '../../../core/auth/auth.service';
import { TestResultType } from '../../../../types/test-result.type';
import { DefaultResponseType } from '../../../../types/default-response.type';
import { Router } from '@angular/router';

@Component({
  selector: 'app-choice',
  templateUrl: './choice.component.html',
  styleUrls: ['./choice.component.scss'],
})
export class ChoiceComponent implements OnInit {
  quizzes: QuizListType[] = [];

  constructor(
    private testService: TestService,
    private authService: AuthService,
    private router: Router
  ) {}

  chooseQuiz(id: number): void {
    this.router.navigate(['/test', id]);
  }

  ngOnInit(): void {
    this.testService.getTests().subscribe((response: QuizListType[]) => {
      this.quizzes = response;

      const userInfo = this.authService.getUserInfo();
      if (userInfo) {
        this.testService.getUserResults(userInfo.userId).subscribe((data) => {
          if (data) {
            if ((data as DefaultResponseType).error !== undefined) {
              throw new Error((data as DefaultResponseType).message);
            }

            const testResult = data as TestResultType[];
            if (testResult) {
              this.quizzes = this.quizzes.map((quiz: QuizListType) => {
                const foundItem: TestResultType | undefined = testResult?.find(
                  (item: TestResultType) => item.testId === quiz.id
                );
                if (foundItem) {
                  quiz.result = foundItem.score + '/' + foundItem.total;
                }

                return quiz;
              });
            }
          }
        });
      }
    });
  }
}
