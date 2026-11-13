import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-navbar',
  styleUrl: './navbar.scss',
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly isMenuOpen = signal(false);

  titleMenu = computed(() => {
    return this.isMenuOpen() ? 'Fermer navigation' : 'Ouvrir navigation';
  });

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }
}
