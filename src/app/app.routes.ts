import { Routes } from '@angular/router';
import { HomeComponent } from './modules/home/home.component';
import { LoginComponent } from './modules/login/login.component';
import { RegisterComponent } from './modules/register/register.component';
import { AddGroupComponent } from './modules/group/add-group/add-group.component';
import { GroupComponent } from './modules/group/group/group.component';
import { MainComponent } from './components/layouts/main/main.component';
import { EditGroupComponent } from './modules/group/edit-group/edit-group.component';
import { HelpComponent } from './modules/help/help.component';

export const routes: Routes = [
    {
        path: '', component: MainComponent,
        children: [
            {
                path: '', component: HomeComponent
            },
            {
                path: 'help', component: HelpComponent
            }
        ]
    },
    {
        path: 'group', component: MainComponent,
        children: [
            {
                path: 'new', component: AddGroupComponent
            },
            {
                path: ':code', component: GroupComponent
            },
            {
                path: ':code/edit', component: EditGroupComponent
            },
            {
                path: '**', redirectTo: 'new'
            }
        ]
    },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'test', component: MainComponent },
    { path: '', redirectTo: '/', pathMatch: 'full' },
    { path: '**', redirectTo: '/' },
];
