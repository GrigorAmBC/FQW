import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class GoogleDocsService {
  private api_key = "AIzaSyCj5RJJYhm9vi-nF04AJQqtdjZNz3UkRgU";
  url = "https://docs.googleapis.com/v1/documents:create?key=" + this.api_key;
  private create_url = "https://docs.googleapis.com/v1/documents";

  constructor(private http: HttpClient) {
  }

  async createDocument() {

  }

  async updateDocument() {

  }

  async getDocument() {

  }

}

