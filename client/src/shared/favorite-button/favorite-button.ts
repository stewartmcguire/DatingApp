import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-favorite-button',
  imports: [],
  templateUrl: './favorite-button.html',
  styleUrl: './favorite-button.css'
})
export class FavoriteButton {
  disabled = input<boolean>();
  selected = input<boolean>();
  clickEvent = output<Event>();

  onClick(event: Event) {
    this.clickEvent.emit(event);
  }
}
