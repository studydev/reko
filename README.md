# [Lambda와 Rekognition을 이용한 대량의 이미지 분석](http://reko.awsdemokr.com/)

동영상에 포함되어 있는 다양한 정보를 쉽고 빠르게 분석하는 솔루션을 구축할 수 있습니다.
VOD 동영상을 [S3](https://aws.amazon.com/ko/s3/)에 업로드하면, [Lambda](https://aws.amazon.com/ko/lambda/)에서 [Elemental MediaConvert](https://aws.amazon.com/ko/mediaconvert/)를 호출하여 대량의 이미지로 분할하여 [S3](https://aws.amazon.com/ko/s3/)에 저장합니다. 대량의 이미지는 [Lambda](https://aws.amazon.com/ko/lambda/)를 활용하여 [Rekognition](https://aws.amazon.com/ko/rekognition/) 서비스를 호출하여 이미지 정보를 수집합니다. 수집 결과물은 [ElasticSearch](https://aws.amazon.com/ko/elasticsearch-service/)에 저장하고 Kibana를 통해 시각화 할 수 있습니다.

## 아키텍처 다이어그램
해당 다이어그램은 미완성 입니다. (2018-10-30 완료 예정)
![Reko 아키텍처 다이어그램](https://github.com/studydev/reko/raw/master/img/reko_architecture.png)


## 시작하기

이 템플릿을 시작하기 위해서는 다음과 같은 순서로 진행합니다:
* [최신 버전의 git repo 다운로드 받기](https://github.com/studydev/reko)
* Clone the repo: `git clone https://github.com/studydev/reko.git`
* Fork the repo

## 실습 순서

실습은 다음과 같은 순서로 진행합니다.: (상세 실습 가이드는 업데이트 예정)
1. 동영상을 다운로드 받습니다.
1. VOD와 이미지를 저장하기 위한 S3 버켓을 생성합니다.
1. 비디오 파일을 업로드하면 이미지로 만들기 위한 Lambda 함수를 생성합니다.
1. Elemental MediaConverter를 통해서 이미지로 변환합니다.
1. 이미지 작업이 완료되면 CloudWatch Event에 의해서 Lambda 함수가 호출되고 리스팅된 이미지 정보를 S3에 저장합니다. (SNS 하나 등록하는 것 고민 or Step Function)
1. Lambda 함수에 의해서 Rekognition을 호출하고 DetectedText를 통해서 이미지를 분석한 정보를 ElasticSearch에 넣습니다.
1. 정적 웹 호스팅을 하는 S3 버킷을 통해서 ES에 들어있는 정보를 쿼리하고, 화면에 특정 Text에 대한 수집 이미지를 표시합니다.
1. 영상 슬라이스 Lambda를 통해서 특정 사람이 지나간 구간의 영상을 짜르는 기능을 수행합니다.

## History 관리
여기는 주요 변경 사항을 기록합니다.

## Copyright and License
2018 저작권 관련 정보 