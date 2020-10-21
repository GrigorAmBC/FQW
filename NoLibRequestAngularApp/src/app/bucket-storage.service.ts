import {Injectable} from '@angular/core';
import {File} from "@google-cloud/storage";
import {HttpClient} from "@angular/common/http";
import {Mp32Wav} from "mp3-to-wav";

@Injectable({
  providedIn: 'root'
})
export class BucketStorageService {
  private bucketName = "speech-to-text-bucket-2020";
  private bucketUrl = `https://storage.googleapis.com/upload/storage/v1/b/${this.bucketName}/o?uploadType=media`;

  constructor(private http: HttpClient) {
  }

  blobToFile(theBlob: Blob, fileName: string): File {
    var b: any = theBlob;
    //A Blob() is almost a File() - it's just missing the two properties below which we will add
    b.lastModifiedDate = new Date();
    b.name = fileName;

    //Cast to a File() type
    return <File><unknown>theBlob;
  }

  mp3ToWav(file) {
    const mp32Wav = new Mp32Wav(file.name, "./");
    
  }

  async uploadFile(file) {
    const response = await this.http.post<File>(this.getBucketPostUrl(file.name), file, {
      headers: {
        'Content-Type': 'audio/wav',
        // 'Authorization': 'Bearer ' + "\"ya29.a0AfH6SMDoiUqQ11-9cJd7EjzSciV1zJBdMkYa8gl9-F-4-Xh8uiBsZUuG6nIkO8Dyc2WiOPo9yo13WibAAIHZAvmdY6LW4cwBkv0iY8Hx9wR-4oSGO0j_Cv-X3D3aAFhzIRkv6QsYxf0wb9dZVEkoEaQ7lKKBv-bpn4o\""//authToken
      },
      responseType: 'json',
      observe: "response"
    }).toPromise();

    console.log(response);
    if (response.ok == true) {
      console.log(`${file.name} uploaded to ${this.bucketName}.`);
      return 'gs://' + response.body.bucket + "/" + response.body.name;
    }
  }

  private getBucketPostUrl(filename: string) {
    return this.bucketUrl + `&name=${filename}`;
  }

}
