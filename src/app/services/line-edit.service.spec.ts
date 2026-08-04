import { TestBed } from '@angular/core/testing';
import { LineEditService } from './line-edit.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LoggerService } from './logger.service';
import { LocalStorageServiceMock } from './local-storage.service.mock';
import { LocalStorageService } from '@app/services/local-storage.service';
import { LoggerServiceMock } from './logger.service.mock';
import { UsersDTO } from '@app/interfaces/users.dto';
import { usersDtoMock } from '@app/test/users.dto.mock';
import * as _ from 'lodash';
import { LoginService } from './login.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LineEditService', () => {
  let service: LineEditService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [MatSnackBarModule],
    providers: [
        { provide: LocalStorageService, useClass: LocalStorageServiceMock },
        { provide: LoggerService, useClass: LoggerServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
});
    
  });

  it('should be created', () => {
    service = TestBed.inject(LineEditService);
    expect(service).toBeTruthy();
  });
  
  it('should parse string with username and pin correctly',  ()=> {
    service = TestBed.inject(LineEditService);
    let loginService = TestBed.inject(LoginService); 

    // Test 1: pin not enough
     let test1Str = "adbcdef112"; 
    expect(_.isNil(service.parseSignatureStringForUserNameAndPin(test1Str))).toEqual(true); 
    
    // Test 2: pin is not all numbers
    const test2Str = "abcdefg1g23456"; 
    expect(_.isNil(service.parseSignatureStringForUserNameAndPin(test2Str))).toEqual(true); 

     // Test 3: user name is empty
    const test3Str = "        123456"; 
    expect(service.parseSignatureStringForUserNameAndPin(test3Str)).toEqual(undefined); 
      
    // Test4: right user but right pin 
    const test5Str = "abcdefg1"+"123456"; 
    expect(service.parseSignatureStringForUserNameAndPin(test5Str).pin).toEqual("123456"); 

    // Test5: right 521 and right pin=>success case 
    const testUserDto: UsersDTO = {
      userId: 0,
      username: 'abcdefg1',
      displayName: 'aDisplayName',
      lastLogin: 0,
      pin: '123456',
      procedureDetails: [],
      // email?: 'email@mail.com',
      isAdmin: true,
    };
    const test6Str = testUserDto.username+testUserDto.pin; 
    expect(service.parseSignatureStringForUserNameAndPin(test6Str).username).toEqual(testUserDto.username); 
  }); 
});
