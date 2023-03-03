import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { QuizListType } from '../../../types/quiz-list.type';
import { Observable } from 'rxjs';
import { TestResultType } from '../../../types/test-result.type';
import { DefaultResponseType } from '../../../types/default-response.type';
import { QuizType } from '../../../types/quiz.type';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor(private http: HttpClient) {}

  getTests(): Observable<QuizListType[]> {
    return this.http.get<QuizListType[]>(environment.apiHost + 'tests');
  }

  getUserResults(
    userId: number
  ): Observable<DefaultResponseType | TestResultType[]> {
    return this.http.get<DefaultResponseType | TestResultType[]>(
      environment.apiHost + 'tests/results?userId=' + userId
    );
  }

  getQuiz(id: number | string): Observable<DefaultResponseType | QuizType> {
    return this.http.get<DefaultResponseType | QuizType>(
      environment.apiHost + 'tests/' + id
    );
  }
}
