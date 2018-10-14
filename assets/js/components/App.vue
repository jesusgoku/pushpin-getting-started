<template>
  <div class="app">
    <ul class="events">
      <li v-for="item in events" :key="item.id" class="events__item">
        <div class="events__item__id">{{ item.id }}</div>
        <div class="events__item__message">{{ item.payload.message }}</div>
      </li>
    </ul>
  </div>
</template>


<script>
import axios from 'axios';


export default {
  name: 'App',

  data: function() {
    return {
      events: [],
    };
  },

  methods: {
    getLastEvents: function() {
      return axios
        .get('http://localhost:3000/events')
        .then(res => this.events = res.data)
      ;
    },

    subscribeLiveEvents: function() {
      const es = new EventSource('/stream');

      es.addEventListener('message', e => {
        const data = JSON.parse(e.data);
        console.log(data);

        this.events = this.events.concat([{
          id: e.lastEventId,
          payload: data,
        }]);
      });

      this.es = es;
    },
  },

  created: function() {
    this
      .getLastEvents()
      .then(this.subscribeLiveEvents)
    ;
  },
}
</script>
