by taking reference from syllabusExaction.ts
write a code in file releventVideSelector which takes List of Topic with video
```
interface TopicWithVideo {
  title: string;
  youtubeVideos: youtubeVideo[];
}

interface youtubeVideo {
  title: string;
  description: string;
  url: string;
}
```
and first select the most relevent video for each topic from the 5 videos, you can either select 1 video or more if required, but the topic should be properly explained you can determine this by video title or description
then return json as output
which is in this format

```
{
  "title": "",
  "is_end_node": false,
  "subtopics": [
    {
      "title": "",
      "is_end_node": false,
      "subtopics": [
        {
          "title": "",
          "is_end_node": true,
          "resources": {
              "id": "res-uuid",
              "type": "youtube_link",
              "data": {
                "url": "https://youtu.be/testvideo"
              }
           }
        },
        {
          "title": "",
          "is_end_node": true,
          "resources": {
              "id": "res-uuid",
              "type": "md_notes",
              "description": "description of notes",
              "data": {
                "id": "data-uuid"
              }
           }
        }
      ]
    }
  ]
}
```
and to make this first determine which topic comes under which topic then make a mindmap like structure you can give name to node by yourself, but make sure every topic given should be covered, you can club topics and give them better name and add these topics under them for better explaination and guide to study
so this mindmap is mainly to guide students how to study
and if you think for some topic thre are not good video then do not add video for that just add notes resource and but do not add notes
but add description of the notes so that i will generate  it later, description should contain a text to guide other LLM to genrate this topic notes, and if you think in some topic there is a need of further explanation by notes even when it has videos then also notes resource in json for that

add the prompt for this task in releventVideoSelector.md
