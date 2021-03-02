import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoTestOneComponent } from './video-test-one.component';

describe('VideoTestOneComponent', () => {
  let component: VideoTestOneComponent;
  let fixture: ComponentFixture<VideoTestOneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VideoTestOneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VideoTestOneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
