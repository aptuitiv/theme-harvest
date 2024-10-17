# Harvest Theme

A basic starting point for an Aptuitiv theme.

## Usage

The goal of this theme is to be copied to another repository for the site you're working on. From there, you can install it on the website, and edit it as needed.

## Installation

### Set Up Repo

You'll want to create a new git repository for the site that this is being installed to. Copy the contents of this repo to that repo. That will allow you to make modifications that only affect that website.

In the command line run `npm i` to install the packages.

Log into the CMS and go to Settings -> Domain / FTP / DNS.

In the project command line run

```bash
npm run init
```

That will initialize the development environment. Follow the prompts to set up the FTP connection.

(If you have the [Aptuitiv website-build-tools](https://github.com/aptuitiv/website-build-tools) installed globally you can do the above things in one step with the `aptuitiv-build init` command.)

### Preparing the CMS

Before deploying, you'll want to log into the CMS for the new site and do the following. These prepare the CMS for deploying the theme files.

1. Configuration
   - Turn on **SSL** by enabling "My site supports SSL", "Entire public site is secure", and "Entire administration is secure" from Settings -> Security.
   - Disable **Cache** under Settings -> Cache.
2. Install the **Theme** configuration by uploading it under Design -> View Themes -> Update and continuing on the next page. We recommend that you first export the theme from the original theme admin and then upload that `theme.json` file to this site.
3. Prime templates
   - Prime the **Page Templates** by visiting Design -> Templates.
   - Delete the "Default" Template from Design -> Templates.
   - Prime the **Snippets** by visiting Design -> Snippets.
   - Prime the **Navigation Templates** by visiting Design -> Navigation -> Navigation Templates.
   - Prime the **Form Templates** by visiting Forms -> Templates.
4. Pages
   - Edit the "Home" page to use the "One Column" *Page Template* from Content -> Pages.

5. Navigation. Go to Design -> Navigation -> Navigation Menus
    - Create a navigation menu called `Footer`.
      - Template: `Footer`
      - Show sub navigation: `Never`.
    - Create a navigation menu called `Main`.
      - Template: `Main`
      - Show sub navigation: `Show all sub navigation all the time`

6. Prime the **Content Builder Elements** by visiting Design -> Content Builder -> Elements.
7. Prime the **Collection Widgets** by visiting Widgets -> Collections -> Notifications.
8. Search
   - Prime the **Search Templates** by visiting Site Manager -> Search -> Templates -> Templates.
   - Edit and save the **Search Form** under Site Manager -> Search -> Forms. This will generate the form fields.

### Deploying the Theme

If you ran `npm run init` as described above then the site files are already built. If not, then run `npm run build` to build the files.

Deploy all of the theme files with `npm run deploy`. That will upload the files via FTP to the server.

### Configuring the Theme

To finish the installation, you'll need to configure some basic options of the theme.

1. Update the **Company Information** under Settings -> Company Information.
1. Configure **Theme Settings** under Design -> Theme Editor.
   1. Go to Settings -> Blocks - Full Width Image. Set the widths to `1400` and `800`.
   2. Go to Settings -> Header and either upload the logo or set the text logo.
   3. Go to Styles -> Blocks - Banners.
      - Large banner images:
        - Set the following image sizes:
          - 2000 x 900
          - 1400 x 630
          - 1000 x 450
          - 700 x 320
          - 450 x 400  
        - Aspect ratio when croping: `20 x 9`.
        - Minimum aspect ratio: `20 x 9`
      - Large banner overlay image
        - Overlay image sizes:
          - 420 x 560
      - Banner bar images:
        - Set the following image sizes:
          - 2000 x 600
          - 1400 x 420
          - 1000 x 300
          - 700 x 300
        - Aspect ratio when croping: `20 x 6`.
        - Minimum aspect ratio: `20 x 6`
   4. Update the **Color Palette** under Palettes -> Color Palette.
   5. Update the **Font Palette** under Palettes -> Font Palette.
   6. Go through all of the **Theme Styles** from the Theme Styles tab and update all color references to use the *Color Palette* if matching one.
   7. Update **Typography** under Styles -> Typography.

You've now got an instance of the theme installed and configured on your new site. From here you can customize the styles in the *Theme Editor* or make template changes.

## Making Changes

If you want to make changes, all you have to do is run `npm run watch` while making all file changes. They will be deployed automatically.

## FTP

We recommend using the [Aptuitiv website-build-tools](https://github.com/aptuitiv/website-build-tools) and the `init` command for generating the `.env` file automatically.

You can alternatively create a manual `.env` file with the following data instead:

```.env
FTP_ENVIRONMENT = live
FTP_SERVER = ftp1.branchcms.com
FTP_USERNAME = my_ftp_username
FTP_PASSWORD = my_ftp_password
```
