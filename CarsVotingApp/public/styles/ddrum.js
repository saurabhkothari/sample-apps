import { datadogRum } from '@datadog/browser-rum';

datadogRum.init({
    applicationId: 'e4ca9c03-dbb5-4605-a435-b382d95f9d47',
    clientToken: 'pub433b183af9e77ed7c565b1b26385a22e',
    // `site` refers to the Datadog site parameter of your organization
    // see https://docs.datadoghq.com/getting_started/site/
    site: 'us5.datadoghq.com',
    service: 'cars',
    env: '<ENV_NAME>',
    // Specify a version number to identify the deployed version of your application in Datadog
    // version: '1.0.0', 
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: 'allow',
});
