import { Component } from '@angular/core';

@Component({
  selector: 'app-menu-layout',
  templateUrl: './menu-layout.component.html',
})
export class MenuLayoutComponent {
  stats = [
    {
      title: 'Pending',
      icon: 'https://img.icons8.com/color/452/story-time.png',
      color: 'bg-red-A700',
      url: '/orders/pending'
    },
    {
      title: 'Packed',
      icon: 'https://cdn0.iconfinder.com/data/icons/kameleon-free-pack-rounded/110/Food-Dome-512.png',
      color: 'bg-pink-A100',
      url: '/orders/packed'
    },
    {
      title: 'Processing',
      icon: 'https://cdn0.iconfinder.com/data/icons/kameleon-free-pack-rounded/110/Food-Dome-512.png',
      color: 'bg-indigo-A400',
      url: '/orders/processing'
    },
    {
      title: 'Delivered',
      icon: 'https://cdn0.iconfinder.com/data/icons/kameleon-free-pack-rounded/110/Food-Dome-512.png',
      color: 'bg-green-A400',
      url: '/orders/delivered'
    },
  ];
constructor(

) {}

}