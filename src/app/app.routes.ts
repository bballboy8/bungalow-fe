import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: 'dashboard', loadChildren: () => import('./components/home/home.component').then(m => m.HomeComponent)
},
];
