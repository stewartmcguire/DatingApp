import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../../../core/services/member-service';
import { Member, Photo } from '../../../types/member';
import { ImageUpload } from "../../../shared/image-upload/image-upload";
import { AccountService } from '../../../core/services/account-service';
import { FavoriteButton } from '../../../shared/favorite-button/favorite-button';
import { DeleteButton } from '../../../shared/delete-button/delete-button';

@Component({
  selector: 'app-member-photos',
  imports: [FavoriteButton,DeleteButton,ImageUpload],
  templateUrl: './member-photos.html',
  styleUrl: './member-photos.css'
})
export class MemberPhotos implements OnInit {
  protected readonly memberService = inject(MemberService);
  protected readonly accountService = inject(AccountService);
  private readonly route  = inject(ActivatedRoute);
  protected photos = signal<Photo[]>([]);
  protected loading = signal<boolean>(false);

  constructor() {
  }
  ngOnInit(): void {
    const memberId = this.route.parent?.snapshot.paramMap.get('id');
    if (memberId) {
      this.memberService.getMemberPhotos(memberId)
        .subscribe(photos => {
          this.photos.set(photos);
        });
    }
  }

  onUploadImage(file: File) {
    this.loading.set(true);
    this.memberService.uploadPhoto(file).subscribe({
      next: (photo: Photo) => {
        this.memberService.editMode.set(false);
        this.loading.set(false);
        this.photos.update(photos => [...photos, photo]);
      },
      error: (error) => {
        this.loading.set(false);
        console.log("Error uploading image: ", error);
      }
    });
  }

  setMainPhoto(photo: Photo) {
    this.memberService.setMainPhoto(photo).subscribe({
      next: () => {
        const currentUser = this.accountService.currentUser();
        if (currentUser) {
          currentUser.imageUrl = photo.url;
          this.accountService.setCurrentUser(currentUser);
          this.memberService.member.update(member => ({
            ...member,
            imageUrl: photo.url
          }) as Member);
        }
      },
      error: (error) => {
        console.log("Error setting main photo: ", error);
      }
    });
  }

  deletePhoto(photoId: number) {
    this.memberService.deletePhoto(photoId).subscribe({
      next: () => {
        this.photos.update(photos => photos.filter(photo => photo.id !== photoId));
      },
      error: (error) => {
        console.log("Error deleting photo: ", error);
      }
    });
  }
}
